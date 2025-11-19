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
  otro_usuario_id: number;
  ultimo_mensaje?: string;
  ultimo_mensaje_fecha?: string;
  mensajes_no_leidos?: number;
  producto_nombre?: string;
  producto_precio?: number;
}

export interface Mensaje {
  id: number;
  conversacion_id: number;
  remitente_id: number;
  remitente_nombre: string;
  remitente_usuario: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
}

export interface NotificacionMensaje {
  tipo?: string;
  conversacionId: number;
  mensaje?: string;
  remitenteNombre?: string;
  remitenteId?: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  private socket: Socket | null = null;
  private apiUrl = `${environment.apiUrl}/chat`;

  // Estado global
  private contadorNoLeidosSubject = new BehaviorSubject<number>(0);
  public contadorNoLeidos$ = this.contadorNoLeidosSubject.asObservable();

  private notificacionesSubject = new BehaviorSubject<NotificacionMensaje[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeSocket();
  }

  // ============================================
  // 🔌 INICIALIZACIÓN DEL SOCKET
  // ============================================
  private initializeSocket() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No hay token; no se conectará Socket.IO');
      return;
    }

    const backendOrigin = new URL(environment.apiUrl).origin;

    this.socket = io(backendOrigin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 800,
      reconnectionAttempts: 10,
    });

    // ---------------------------------------------
    // CONEXIÓN
    // ---------------------------------------------
    this.socket.on('connect', () => {
      console.log(`🟢 Conectado a Socket.IO (ID: ${this.socket?.id})`);
      this.actualizarContadorNoLeidos();
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 Socket.IO desconectado');
    });

    this.socket.on('connect_error', (err) => {
      console.error('⚠️ Error de conexión Socket.IO:', err.message);
    });

    // ---------------------------------------------
    // EVENTO: NUEVO MENSAJE EN LA SALA
    // ---------------------------------------------
    this.socket.on('nuevo_mensaje', (mensaje: Mensaje) => {
      console.log('💬 Mensaje entrante:', mensaje);
    });

    // ---------------------------------------------
    // EVENTO: NOTIFICACIÓN GLOBAL
    // (llega cuando el backend usa emitirNotificacionMensaje)
    // ---------------------------------------------
    // EVENTO: NOTIFICACIÓN GLOBAL (toast + badge)
    this.socket.on('notificacion_mensaje', (data: NotificacionMensaje) => {
      console.log('🔔 Notificación recibida:', data);

      if (data?.tipo === 'nuevo_mensaje') {
        // O puedes llamar this.actualizarContadorNoLeidos() si quieres siempre traerlo desde backend
        const actual = this.contadorNoLeidosSubject.value;
        this.contadorNoLeidosSubject.next(actual + 1);
      }

      const lista = this.notificacionesSubject.value;
      this.notificacionesSubject.next([data, ...lista]);
    });


    // ---------------------------------------------
    // NUEVA CONVERSACIÓN
    // ---------------------------------------------
    this.socket.on('nueva_conversacion', (data) => {
      console.log('🆕 Nueva conversación disponible:', data);

      const lista = this.notificacionesSubject.value;
      this.notificacionesSubject.next([
        {
          tipo: 'nueva_conversacion',
          conversacionId: data.conversacionId,
          remitenteId: data.usuarioId,
        },
        ...lista,
      ]);
    });

    // ---------------------------------------------
    // EVENTO: mensajes leídos
    // ---------------------------------------------
    this.socket.on('mensajes_leidos', () => {
      console.log('📘 Conversación marcada como leída (socket)');
      this.actualizarContadorNoLeidos();
    });
  }

  // ============================================
  // 🔄 CONTROL MANUAL DE RECONEXIÓN
  // ============================================
  public reconnectSocket() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  // ============================================
  // 🧩 GESTIÓN DE SALAS
  // ============================================
  public joinConversacion(conversacionId: number) {
    this.socket?.emit('join_conversacion', conversacionId);
    console.log(`📌 Te uniste a conversacion_${conversacionId}`);
  }

  public leaveConversacion(conversacionId: number) {
    this.socket?.emit('leave_conversacion', conversacionId);
    console.log(`📤 Saliste de conversacion_${conversacionId}`);
  }

  // ============================================
  // 📡 LISTENER: NUEVO MENSAJE
  // ============================================
  public onNuevoMensaje(): Observable<Mensaje> {
    return new Observable((subscriber) => {
      if (!this.socket) return subscriber.error('Socket no inicializado');

      const listener = (mensaje: Mensaje) => subscriber.next(mensaje);

      this.socket.on('nuevo_mensaje', listener);

      return () => this.socket?.off('nuevo_mensaje', listener);
    });
  }

  // ============================================
  // ✍ TYPING INDICATOR
  // ============================================
  public emitTyping(conversacionId: number, isTyping: boolean) {
    this.socket?.emit('typing', { conversacionId, isTyping });
  }

  public onUserTyping(): Observable<{ usuarioId: number; isTyping: boolean }> {
    return new Observable((subscriber) => {
      if (!this.socket) return subscriber.error('Socket no inicializado');

      const listener = (data: any) => subscriber.next(data);

      this.socket.on('user_typing', listener);

      return () => this.socket?.off('user_typing', listener);
    });
  }

  // ============================================
  // 📡 API REST - CONVERSACIONES
  // ============================================
  getConversaciones() {
    return this.http.get<{ success: boolean; conversaciones: Conversacion[] }>(
      `${this.apiUrl}/conversaciones`
    );
  }

  buscarUsuarios(termino: string) {
    const authUrl = `${environment.apiUrl}/api/auth`;

    return this.http.get<{ success: boolean; usuarios: any[]; total: number }>(
      `${authUrl}/usuarios/buscar`,
      { params: { q: termino } }
    );
  }

  buscarConversaciones(q: string) {
    return this.http.get<{ success: boolean; resultados: Conversacion[]; total: number }>(
      `${this.apiUrl}/conversaciones/buscar`,
      { params: { q } }
    );
  }

  obtenerOCrearConversacion(otroUsuarioId: number, productoId?: number | null) {
    return this.http.post<{ success: boolean; conversacion: Conversacion; nueva: boolean }>(
      `${this.apiUrl}/conversaciones`,
      { otroUsuarioId, productoId: productoId ?? null }
    );
  }

  eliminarConversacion(conversacionId: number) {
    return this.http.delete<{ success: boolean; mensaje: string }>(
      `${this.apiUrl}/conversaciones/${conversacionId}`
    );
  }

  // ============================================
  // 💬 API REST - MENSAJES
  // ============================================
  getMensajes(conversacionId: number) {
    return this.http.get<{ success: boolean; mensajes: Mensaje[] }>(
      `${this.apiUrl}/${conversacionId}/mensajes`
    );
  }

  getMensajesPaginados(conversacionId: number, pagina = 1, limite = 50) {
    return this.http.get<any>(`${this.apiUrl}/${conversacionId}/mensajes/paginados`, {
      params: { pagina, limite },
    });
  }

  enviarMensaje(conversacionId: number, mensaje: string) {
    return this.http.post<{ success: boolean; mensaje: Mensaje }>(
      `${this.apiUrl}/${conversacionId}/mensajes`,
      { mensaje }
    );
  }

  // ============================================
  // 🔔 CONTADOR DE NO LEÍDOS
  // ============================================
  getContadorNoLeidos() {
    return this.http.get<{ success: boolean; totalNoLeidos: number }>(
      `${this.apiUrl}/no-leidos`
    );
  }

  actualizarContadorNoLeidos() {
    this.getContadorNoLeidos().subscribe({
      next: (res) => {
        this.contadorNoLeidosSubject.next(res.totalNoLeidos);
      },
      error: (err) => console.error('Error actualizando contador:', err),
    });
  }

  marcarConversacionLeida(conversacionId: number) {
    return this.http.put<{ success: boolean; mensaje: string }>(
      `${this.apiUrl}/${conversacionId}/marcar-leido`,
      {}
    );
  }

  limpiarNotificaciones() {
    this.notificacionesSubject.next([]);
  }

  // ============================================
  // 🧹 CLEANUP
  // ============================================
  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🧼 Socket.IO desconectado y limpiado');
    }
  }
}
