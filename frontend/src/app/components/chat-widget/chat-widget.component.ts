// chat-widget.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Conversacion, Mensaje } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatBody') private chatBody?: ElementRef;
  
  // Estado del widget
  abierto = false;
  vistaActual: 'conversaciones' | 'chat' = 'conversaciones';
  
  // Datos
  conversaciones: Conversacion[] = [];
  mensajes: Mensaje[] = [];
  conversacionActiva: Conversacion | null = null;
  mensajeNuevo = '';
  
  // Estados de carga
  cargandoConversaciones = false;
  cargandoMensajes = false;
  enviandoMensaje = false;
  
  // Contador de no leídos
  totalNoLeidos = 0;
  
  // Typing indicator
  otroUsuarioEscribiendo = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(public chatService: ChatService) {}

  ngOnInit() {
    // Suscribirse al contador de no leídos
    const contadorSub = this.chatService.contadorNoLeidos$.subscribe((total) => {
      this.totalNoLeidos = total;
    });
    this.subscriptions.push(contadorSub);

    // Suscribirse a nuevos mensajes
    const mensajesSub = this.chatService.onNuevoMensaje().subscribe((msg) => {
      // Si es de la conversación activa, agregar al array
      if (this.conversacionActiva && msg.conversacion_id === this.conversacionActiva.id) {
        this.mensajes.push(msg);
        this.shouldScrollToBottom = true;
      } else {
        // Si no, recargar lista de conversaciones para actualizar último mensaje
        if (this.abierto && this.vistaActual === 'conversaciones') {
          this.cargarConversaciones();
        }
      }
    });
    this.subscriptions.push(mensajesSub);

    // Suscribirse al indicador de "escribiendo"
    const typingSub = this.chatService.onUserTyping().subscribe((data) => {
      if (this.conversacionActiva && data.usuarioId !== this.getUserId()) {
        this.otroUsuarioEscribiendo = data.isTyping;
        
        // Auto-ocultar después de 3 segundos
        if (data.isTyping) {
          setTimeout(() => {
            this.otroUsuarioEscribiendo = false;
          }, 3000);
        }
      }
    });
    this.subscriptions.push(typingSub);

    // Actualizar contador al iniciar
    this.chatService.actualizarContadorNoLeidos();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ============================================
  // MÉTODOS DE NAVEGACIÓN
  // ============================================

  toggleChat() {
    this.abierto = !this.abierto;
    
    if (this.abierto) {
      this.vistaActual = 'conversaciones';
      this.cargarConversaciones();
      this.chatService.actualizarContadorNoLeidos();
    } else {
      // Al cerrar, salir de la conversación activa
      if (this.conversacionActiva) {
        this.chatService.leaveConversacion(this.conversacionActiva.id);
        this.conversacionActiva = null;
      }
    }
  }

  cerrarChat() {
    this.abierto = false;
    if (this.conversacionActiva) {
      this.chatService.leaveConversacion(this.conversacionActiva.id);
      this.conversacionActiva = null;
    }
  }

  volverAConversaciones() {
    if (this.conversacionActiva) {
      this.chatService.leaveConversacion(this.conversacionActiva.id);
    }
    this.conversacionActiva = null;
    this.vistaActual = 'conversaciones';
    this.mensajes = [];
    this.cargarConversaciones();
  }

  // ============================================
  // MÉTODOS DE CONVERSACIONES
  // ============================================

  cargarConversaciones() {
    this.cargandoConversaciones = true;
    this.chatService.getConversaciones().subscribe({
      next: (res) => {
        this.conversaciones = res.conversaciones;
        this.cargandoConversaciones = false;
      },
      error: (err) => {
        console.error('Error al cargar conversaciones:', err);
        this.cargandoConversaciones = false;
      }
    });
  }

  abrirConversacion(conv: Conversacion) {
    this.conversacionActiva = conv;
    this.vistaActual = 'chat';
    this.mensajes = [];
    this.cargarMensajes(conv.id);
    this.chatService.joinConversacion(conv.id);
    
    // Marcar como leída
    this.chatService.marcarConversacionLeida(conv.id).subscribe({
      next: () => {
        conv.mensajes_no_leidos = 0;
        this.chatService.actualizarContadorNoLeidos();
      }
    });
  }

  // ============================================
  // MÉTODOS DE MENSAJES
  // ============================================

  cargarMensajes(id: number) {
    this.cargandoMensajes = true;
    this.chatService.getMensajes(id).subscribe({
      next: (res) => {
        this.mensajes = res.mensajes;
        this.cargandoMensajes = false;
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        console.error('Error al cargar mensajes:', err);
        this.cargandoMensajes = false;
      }
    });
  }

  enviarMensaje() {
    if (!this.mensajeNuevo.trim() || !this.conversacionActiva || this.enviandoMensaje) {
      return;
    }

    const texto = this.mensajeNuevo;
    this.mensajeNuevo = '';
    this.enviandoMensaje = true;

    // Detener indicador de "escribiendo"
    this.chatService.emitTyping(this.conversacionActiva.id, false);

    this.chatService.enviarMensaje(this.conversacionActiva.id, texto).subscribe({
      next: (res) => {
        // El mensaje se agregará automáticamente vía WebSocket
        this.enviandoMensaje = false;
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.enviandoMensaje = false;
        this.mensajeNuevo = texto; // Restaurar mensaje
      }
    });
  }

  onInputChange() {
    if (this.conversacionActiva && this.mensajeNuevo.trim()) {
      this.chatService.emitTyping(this.conversacionActiva.id, true);
    } else if (this.conversacionActiva) {
      this.chatService.emitTyping(this.conversacionActiva.id, false);
    }
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  getUserId(): number {
    // Obtener ID del usuario actual desde localStorage o servicio de auth
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    return usuario.id || 0;
  }

  esMiMensaje(mensaje: Mensaje): boolean {
    return mensaje.remitente_id === this.getUserId();
  }

  private scrollToBottom(): void {
    try {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  formatearFecha(fecha?: string): string {
  if (!fecha) {
    return '';
  }

  const date = new Date(fecha);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  if (date.toDateString() === hoy.toDateString()) {
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  } else if (date.toDateString() === ayer.toDateString()) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
  }
}

}
