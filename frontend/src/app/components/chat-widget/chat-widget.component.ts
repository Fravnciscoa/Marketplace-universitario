import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, Conversacion, Mensaje, NotificacionMensaje } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';

interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  correo: string;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('chatBody') private chatBody?: ElementRef;

  // Estado de UI
  abierto = false;
  vistaActual: 'conversaciones' | 'chat' | 'buscar' = 'conversaciones';

  // Datos principales
  conversaciones: Conversacion[] = [];
  mensajes: Mensaje[] = [];
  conversacionActiva: Conversacion | null = null;
  mensajeNuevo = '';

  // Estados de carga
  cargandoConversaciones = false;
  cargandoMensajes = false;
  enviandoMensaje = false;

  // Estado de notificaciones
  totalNoLeidos = 0;
  otroUsuarioEscribiendo = false;

  // Búsqueda
  terminoBusqueda = '';
  usuariosEncontrados: Usuario[] = [];
  buscandoUsuarios = false;

  // Manejo interno
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;
  private typingTimeout: any;

  constructor(
    public chatService: ChatService,
    private router: Router
  ) {}

  // ============================================
  // CICLO DE VIDA
  // ============================================
  ngOnInit() {

    // 🔵 Contador global de no leídos
    const subContador = this.chatService.contadorNoLeidos$.subscribe(total => {
      this.totalNoLeidos = total;
    });
    this.subscriptions.push(subContador);

    // 💬 Mensajes entrantes en tiempo real
    const subMensajes = this.chatService.onNuevoMensaje().subscribe(msg => {
      if (!this.conversacionActiva) return;

      if (msg.conversacion_id === this.conversacionActiva.id) {
        this.mensajes.push(msg);
        this.shouldScrollToBottom = true;

        // Actualizar preview en la lista
        this.conversacionActiva.ultimo_mensaje = msg.mensaje;
        this.conversacionActiva.ultimo_mensaje_fecha = msg.created_at;

      } else {
        // Actualizar lista si está visible
        if (this.abierto && this.vistaActual === 'conversaciones') {
          this.cargarConversaciones();
        }
      }
    });
    this.subscriptions.push(subMensajes);

    // ✍️ Indicador de "escribiendo"
    const subTyping = this.chatService.onUserTyping().subscribe(data => {
      if (!this.conversacionActiva) return;
      if (data.usuarioId === this.getUserId()) return;

      this.otroUsuarioEscribiendo = data.isTyping;
      if (data.isTyping) {
        setTimeout(() => (this.otroUsuarioEscribiendo = false), 3000);
      }
    });
    this.subscriptions.push(subTyping);

    // 🔔 Notificaciones globales
    const subNoti = this.chatService.notificaciones$.subscribe(noti => {
      // No se muestra en UI acá, pero queda disponible
      // para badge global o toasts.
    });
    this.subscriptions.push(subNoti);

    this.chatService.actualizarContadorNoLeidos();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ============================================
  // UI PRINCIPAL
  // ============================================
  toggleChat() {
    this.abierto = !this.abierto;

    if (this.abierto) {
      this.vistaActual = 'conversaciones';
      this.cargarConversaciones();
      this.chatService.actualizarContadorNoLeidos();
    } else {
      this.cerrarChatCompleto();
    }
  }

  cerrarChat() {
    this.abierto = false;
    this.cerrarChatCompleto();
  }

  private cerrarChatCompleto() {
    if (this.conversacionActiva) {
      this.chatService.leaveConversacion(this.conversacionActiva.id);
      this.conversacionActiva = null;
    }
    this.vistaActual = 'conversaciones';
    this.mensajes = [];
    this.usuariosEncontrados = [];
    this.terminoBusqueda = '';
  }

  volverAConversaciones() {
    if (this.conversacionActiva) {
      this.chatService.leaveConversacion(this.conversacionActiva.id);
    }
    this.conversacionActiva = null;
    this.mensajes = [];
    this.vistaActual = 'conversaciones';
    this.cargarConversaciones();
  }

  // ============================================
  // CONVERSACIONES
  // ============================================
  cargarConversaciones() {
    this.cargandoConversaciones = true;

    this.chatService.getConversaciones().subscribe({
      next: res => {
        this.conversaciones = res.conversaciones;
        this.cargandoConversaciones = false;
      },
      error: err => {
        console.error('Error al cargar conversaciones:', err);
        this.cargandoConversaciones = false;
      }
    });
  }

  abrirConversacion(conv: Conversacion) {
    this.conversacionActiva = conv;
    this.vistaActual = 'chat';
    this.mensajes = [];

    // Obtener historial
    this.cargarMensajes(conv.id);

    // Unirse a la sala
    this.chatService.joinConversacion(conv.id);

    // Marcar como leído
    this.chatService.marcarConversacionLeida(conv.id).subscribe(() => {
      conv.mensajes_no_leidos = 0;
      this.chatService.actualizarContadorNoLeidos();
    });
  }

  // ============================================
  // MENSAJES
  // ============================================
  cargarMensajes(id: number) {
    this.cargandoMensajes = true;

    this.chatService.getMensajes(id).subscribe({
      next: res => {
        this.mensajes = res.mensajes;
        this.cargandoMensajes = false;
        this.shouldScrollToBottom = true;
      },
      error: err => {
        console.error('Error al cargar mensajes:', err);
        this.cargandoMensajes = false;
      }
    });
  }

  enviarMensaje() {
    if (!this.conversacionActiva) return;
    if (!this.mensajeNuevo.trim()) return;
    if (this.enviandoMensaje) return;

    const texto = this.mensajeNuevo;
    this.mensajeNuevo = '';
    this.enviandoMensaje = true;

    this.chatService.emitTyping(this.conversacionActiva.id, false);

    this.chatService.enviarMensaje(this.conversacionActiva.id, texto).subscribe({
      next: () => {
        this.enviandoMensaje = false;
      },
      error: err => {
        console.error('Error al enviar mensaje:', err);
        this.enviandoMensaje = false;
        this.mensajeNuevo = texto; // restaurar
      }
    });
  }

  onInputChange() {
    if (!this.conversacionActiva) return;

    if (this.typingTimeout) clearTimeout(this.typingTimeout);

    if (this.mensajeNuevo.trim()) {
      this.chatService.emitTyping(this.conversacionActiva.id, true);
      this.typingTimeout = setTimeout(() => {
        this.chatService.emitTyping(this.conversacionActiva!.id, false);
      }, 1800);
    } else {
      this.chatService.emitTyping(this.conversacionActiva.id, false);
    }
  }

  // ============================================
  // BÚSQUEDA DE USUARIOS
  // ============================================
  buscarUsuarios() {
    const term = this.terminoBusqueda.trim();

    if (term.length < 3) {
      this.usuariosEncontrados = [];
      return;
    }

    this.buscandoUsuarios = true;

    this.chatService.buscarUsuarios(term).subscribe({
      next: res => {
        this.usuariosEncontrados = res.usuarios || [];
        this.buscandoUsuarios = false;
      },
      error: err => {
        console.error('Error al buscar usuarios:', err);
        this.usuariosEncontrados = [];
        this.buscandoUsuarios = false;
      }
    });
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.usuariosEncontrados = [];
  }

  iniciarConversacion(usuario: Usuario) {
    this.buscandoUsuarios = true;

    this.chatService.obtenerOCrearConversacion(usuario.id).subscribe({
      next: res => {
        if (res.conversacion) {
          const c = res.conversacion;

          // Si backend no devolvió bien los datos, completarlos
          c.otro_usuario_id ||= usuario.id;
          c.otro_usuario_usuario ||= usuario.usuario;
          c.otro_usuario_nombre ||= usuario.nombre;

          // Limpiar búsqueda
          this.usuariosEncontrados = [];
          this.terminoBusqueda = '';
          this.buscandoUsuarios = false;

          this.abrirConversacion(c);
        }
      },
      error: err => {
        console.error('Error al iniciar conversación:', err);
        this.buscandoUsuarios = false;
        alert('No se pudo iniciar la conversación');
      }
    });
  }

  // ============================================
  // PERFIL
  // ============================================
  irAPerfil(usuarioId: number) {
    this.cerrarChat();
    this.router.navigate(['/perfil', usuarioId]);
  }

  irAPerfilActual() {
    if (this.conversacionActiva) {
      this.irAPerfil(this.conversacionActiva.otro_usuario_id);
    }
  }

  // ============================================
  // UTILIDADES
  // ============================================
  private scrollToBottom() {
    try {
      if (this.chatBody) {
        const el = this.chatBody.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch (e) {
      console.error('Error al hacer scroll:', e);
    }
  }

  getUserId(): number {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario.id || 0;
  }

  esMiMensaje(msg: Mensaje): boolean {
    return msg.remitente_id === this.getUserId();
  }

  formatearFecha(fecha?: string) {
    if (!fecha) return '';
    const d = new Date(fecha);
    const hoy = new Date();

    if (d.toDateString() === hoy.toDateString()) {
      return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    }

    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    if (d.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    }

    if (hoy.getTime() - d.getTime() < 7 * 86400000) {
      return d.toLocaleDateString('es-CL', { weekday: 'short' });
    }

    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
  }

  formatearHoraMensaje(fecha?: string) {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }
}