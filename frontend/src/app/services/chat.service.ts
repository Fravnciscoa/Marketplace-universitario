// frontend/src/app/services/chat.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../environments/environment';

// ============================================
// INTERFACES
// ============================================
export interface Conversacion {
  id: number;
  usuario1_id: number;
  usuario2_id: number;
  producto_id: number | null;
  created_at: string;
  updated_at: string;
  otro_usuario_nombre: string;
  otro_usuario_usuario: string;
  otro_usuario_id: number;              // ← AGREGADO
  ultimo_mensaje?: string;
  ultimo_mensaje_fecha?: string;        // ← AGREGADO
  mensajes_no_leidos?: number;
  producto_nombre?: string;             // ← AGREGADO
  producto_precio?: number;             // ← AGREGADO
}

export interface Mensaje {
  id: number;
  conversacion_id: number;
  remitente_id: number;
  remitente_nombre: string;
  remitente_usuario: string;            // ← AGREGADO
  mensaje: string;
  leido: boolean;
  created_at: string;
}

export interface NotificacionMensaje {
  conversacionId: number;
  mensaje: string;
  remitenteNombre: string;
  remitenteId: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  private socket: Socket | null = null;
  private apiUrl = `${environment.apiUrl}/chat`;
  
  // BehaviorSubjects para estado global
  private contadorNoLeidosSubject = new BehaviorSubject<number>(0);
  public contadorNoLeidos$ = this.contadorNoLeidosSubject.asObservable();
  
  private notificacionesSubject = new BehaviorSubject<NotificacionMensaje[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeSocket();
  }

  // ============================================
  // 🔌 SOCKET.IO - CONEXIÓN Y EVENTOS
  // ============================================
  
  private initializeSocket() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No hay token, no se conectará Socket.IO');
      return;
    }

    const backendOrigin = new URL(environment.apiUrl).origin;
    
    this.socket = io(backendOrigin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ Conectado a Socket.IO - ID:', this.socket?.id);
      this.actualizarContadorNoLeidos();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado de Socket.IO:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Error de conexión Socket.IO:', error.message);
    });

    // Evento: Notificación de nuevo mensaje (global)
    this.socket.on('notificacion_mensaje', (data: NotificacionMensaje) => {
      console.log('🔔 Nueva notificación de mensaje:', data);
      
      // Actualizar contador
      const actual = this.contadorNoLeidosSubject.value;
      this.contadorNoLeidosSubject.next(actual + 1);
      
      // Agregar a lista de notificaciones
      const notificaciones = this.notificacionesSubject.value;
      this.notificacionesSubject.next([data, ...notificaciones]);
    });

    // Evento: Nueva conversación creada
    this.socket.on('nueva_conversacion', (data) => {
      console.log('🆕 Nueva conversación creada:', data);
    });

    // Evento: Mensajes marcados como leídos
    this.socket.on('mensajes_leidos', (data) => {
      console.log('✅ Mensajes marcados como leídos:', data);
      this.actualizarContadorNoLeidos();
    });
  }

  // Reconectar socket manualmente
  public reconnectSocket() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  // Unirse a una conversación específica
  public joinConversacion(conversacionId: number) {
    if (!this.socket) {
      console.warn('⚠️ Socket no inicializado');
      return;
    }
    this.socket.emit('join_conversacion', conversacionId);
    console.log(`📌 Unido a conversacion_${conversacionId}`);
  }

  // Salir de una conversación
  public leaveConversacion(conversacionId: number) {
    this.socket?.emit('leave_conversacion', conversacionId);
    console.log(`📤 Salido de conversacion_${conversacionId}`);
  }

  // Observable para escuchar nuevos mensajes
  public onNuevoMensaje(): Observable<Mensaje> {
    return new Observable((subscriber) => {
      if (!this.socket) {
        subscriber.error('Socket no inicializado');
        return;
      }

      this.socket.on('nuevo_mensaje', (mensaje: Mensaje) => {
        subscriber.next(mensaje);
      });

      return () => {
        this.socket?.off('nuevo_mensaje');
      };
    });
  }

  // Emitir evento "typing"
  public emitTyping(conversacionId: number, isTyping: boolean) {
    this.socket?.emit('typing', { conversacionId, isTyping });
  }

  // Observable para escuchar cuando alguien está escribiendo
  public onUserTyping(): Observable<{ usuarioId: number; isTyping: boolean }> {
    return new Observable((subscriber) => {
      if (!this.socket) {
        subscriber.error('Socket no inicializado');
        return;
      }

      this.socket.on('user_typing', (data) => {
        subscriber.next(data);
      });

      return () => {
        this.socket?.off('user_typing');
      };
    });
  }

  // ============================================
  // 📡 API REST - CONVERSACIONES
  // ============================================

  // Obtener todas las conversaciones
  public getConversaciones() {
    return this.http.get<{ success: boolean; conversaciones: Conversacion[] }>(
      `${this.apiUrl}/conversaciones`
    );
  }
// ...

// 🔍 Buscar usuarios (ahora usa el endpoint de auth)
buscarUsuarios(termino: string): Observable<{ success: boolean; usuarios: any[]; total: number }> {
  // Cambiar la URL para usar el endpoint de auth en lugar de chat
  const authUrl = `${environment.apiUrl}/api/auth`;
  
  return this.http.get<{ success: boolean; usuarios: any[]; total: number }>(
    `${authUrl}/usuarios/buscar`,
    {
      params: { q: termino }
    }
  );
}

  // Buscar conversaciones
  public buscarConversaciones(q: string) {
    return this.http.get<{ success: boolean; resultados: Conversacion[]; total: number }>(
      `${this.apiUrl}/conversaciones/buscar`,
      { params: { q } }
    );
  }

  // Obtener o crear conversación
  public obtenerOCrearConversacion(otroUsuarioId: number, productoId?: number | null) {
    return this.http.post<{ success: boolean; conversacion: Conversacion; nueva: boolean }>(
      `${this.apiUrl}/conversaciones`,
      {
        otroUsuarioId,
        productoId: productoId ?? null,
      }
    );
  }

  // Eliminar conversación
  public eliminarConversacion(conversacionId: number) {
    return this.http.delete<{ success: boolean; mensaje: string }>(
      `${this.apiUrl}/conversaciones/${conversacionId}`
    );
  }

  // ============================================
  // 💬 API REST - MENSAJES
  // ============================================

  // Obtener mensajes de una conversación
  public getMensajes(conversacionId: number) {
    return this.http.get<{ success: boolean; mensajes: Mensaje[] }>(
      `${this.apiUrl}/${conversacionId}/mensajes`
    );
  }

  // Obtener mensajes paginados
  public getMensajesPaginados(conversacionId: number, pagina = 1, limite = 50) {
    return this.http.get<{
      success: boolean;
      mensajes: Mensaje[];
      paginacion: {
        pagina: number;
        limite: number;
        total: number;
        totalPaginas: number;
        tieneSiguiente: boolean;
        tieneAnterior: boolean;
      };
    }>(`${this.apiUrl}/${conversacionId}/mensajes/paginados`, {
      params: { pagina, limite } as any,
    });
  }

  // Enviar mensaje
  public enviarMensaje(conversacionId: number, mensaje: string) {
    return this.http.post<{ success: boolean; mensaje: Mensaje }>(
      `${this.apiUrl}/${conversacionId}/mensajes`,
      { mensaje }
    );
  }

  // ============================================
  // 🔔 API REST - NOTIFICACIONES Y CONTADOR
  // ============================================

  // Obtener contador de mensajes no leídos
  public getContadorNoLeidos() {
    return this.http.get<{ success: boolean; totalNoLeidos: number }>(
      `${this.apiUrl}/no-leidos`
    );
  }

  // Marcar conversación como leída
  public marcarConversacionLeida(conversacionId: number) {
    return this.http.put<{ success: boolean; mensaje: string }>(
      `${this.apiUrl}/${conversacionId}/marcar-leido`,
      {}
    );
  }

  // Actualizar contador de no leídos (método público)
  public actualizarContadorNoLeidos() {
    this.getContadorNoLeidos().subscribe({
      next: (res) => {
        this.contadorNoLeidosSubject.next(res.totalNoLeidos);
      },
      error: (err) => {
        console.error('Error al actualizar contador:', err);
      }
    });
  }

  // Limpiar notificaciones
  public limpiarNotificaciones() {
    this.notificacionesSubject.next([]);
  }

  // ============================================
  // 🧹 CLEANUP
  // ============================================

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket.IO desconectado y limpiado');
    }
  }
}
