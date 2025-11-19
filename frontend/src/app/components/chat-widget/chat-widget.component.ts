import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, Conversacion, Mensaje } from '../../services/chat.service';
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

  abierto = false;
  vistaActual: 'conversaciones' | 'chat' | 'buscar' = 'conversaciones';

  conversaciones: Conversacion[] = [];
  mensajes: Mensaje[] = [];
  conversacionActiva: Conversacion | null = null;
  mensajeNuevo = '';

  cargandoConversaciones = false;
  cargandoMensajes = false;
  enviandoMensaje = false;

  totalNoLeidos = 0;
  otroUsuarioEscribiendo = false;

  terminoBusqueda = '';
  usuariosEncontrados: Usuario[] = [];
  buscandoUsuarios = false;

  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;
  private typingTimeout: any;

  constructor(
    public chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse al contador de mensajes no leídos
    const contadorSub = this.chatService.contadorNoLeidos$.subscribe((total) => {
      this.totalNoLeidos = total;
    });
    this.subscriptions.push(contadorSub);

    // Escuchar nuevos mensajes en tiempo real
    const mensajesSub = this.chatService.onNuevoMensaje().subscribe((msg) => {
      console.log('💬 Nuevo mensaje recibido:', msg);
      
      if (this.conversacionActiva && msg.conversacion_id === this.conversacionActiva.id) {
        // Si el mensaje es de la conversación activa, agregarlo
        this.mensajes.push(msg);
        this.shouldScrollToBottom = true;
        
        // Actualizar último mensaje en la conversación
        this.conversacionActiva.ultimo_mensaje = msg.mensaje;
        this.conversacionActiva.ultimo_mensaje_fecha = msg.created_at;
      } else {
        // Si es de otra conversación, actualizar la lista de conversaciones
        if (this.abierto && this.vistaActual === 'conversaciones') {
          this.cargarConversaciones();
        }
      }
    });
    this.subscriptions.push(mensajesSub);

    // Escuchar cuando alguien está escribiendo
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

    // Actualizar contador inicial
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
  // CONTROL DE VENTANA
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
    this.usuariosEncontrados = [];
    this.terminoBusqueda = '';
    this.mensajes = [];
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
  // CONVERSACIONES
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
    
    // Unirse a la sala de Socket.IO
    this.chatService.joinConversacion(conv.id);

    // Marcar mensajes como leídos
    this.chatService.marcarConversacionLeida(conv.id).subscribe({
      next: () => {
        conv.mensajes_no_leidos = 0;
        this.chatService.actualizarContadorNoLeidos();
      }
    });
  }

  // ============================================
  // MENSAJES
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
      next: () => {
        this.enviandoMensaje = false;
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.enviandoMensaje = false;
        // Restaurar el mensaje en caso de error
        this.mensajeNuevo = texto;
      }
    });
  }

  onInputChange() {
    if (!this.conversacionActiva) return;

    // Limpiar timeout anterior
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    if (this.mensajeNuevo.trim()) {
      // Emitir que está escribiendo
      this.chatService.emitTyping(this.conversacionActiva.id, true);
      
      // Detener después de 2 segundos de inactividad
      this.typingTimeout = setTimeout(() => {
        this.chatService.emitTyping(this.conversacionActiva!.id, false);
      }, 2000);
    } else {
      // Si borró todo, detener inmediatamente
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
      next: (res) => {
        this.usuariosEncontrados = res.usuarios || [];
        this.buscandoUsuarios = false;
        console.log('Usuarios encontrados:', this.usuariosEncontrados);
      },
      error: (err) => {
        console.error('Error al buscar usuarios:', err);
        this.usuariosEncontrados = [];
        this.buscandoUsuarios = false;
      }
    });
  }

  iniciarConversacion(usuario: Usuario) {
  console.log('🔵 Iniciando conversación con:', usuario);
  
  this.buscandoUsuarios = true;
  
  this.chatService.obtenerOCrearConversacion(usuario.id).subscribe({
    next: (res) => {
      console.log('✅ Respuesta del servidor:', res);
      
      if (res.conversacion) {
        // Enriquecer la conversación con datos del usuario si no vienen
        const conversacion = res.conversacion;
        
        // Asegurarse de que tenga la información del otro usuario
        if (!conversacion.otro_usuario_nombre) {
          conversacion.otro_usuario_nombre = usuario.nombre;
        }
        if (!conversacion.otro_usuario_usuario) {
          conversacion.otro_usuario_usuario = usuario.usuario;
        }
        if (!conversacion.otro_usuario_id) {
          conversacion.otro_usuario_id = usuario.id;
        }
        
        console.log('📝 Conversación procesada:', conversacion);
        
        // Limpiar búsqueda
        this.usuariosEncontrados = [];
        this.terminoBusqueda = '';
        this.buscandoUsuarios = false;
        
        // Abrir conversación
        this.abrirConversacion(conversacion);
        
        console.log('✅ Conversación abierta correctamente');
      } else {
        console.error('❌ No se recibió conversación en la respuesta');
        this.buscandoUsuarios = false;
      }
    },
    error: (err) => {
      console.error('❌ Error al crear conversación:', err);
      console.error('Detalles del error:', err.error);
      this.buscandoUsuarios = false;
      
      // Mostrar alerta al usuario
      alert('Error al iniciar conversación. Por favor intenta de nuevo.');
    }
  });
}

  // ============================================
  // NAVEGACIÓN A PERFIL
  // ============================================

  irAPerfil(usuarioId: number) {
    console.log('Navegando al perfil del usuario:', usuarioId);
    
    // Cerrar el chat
    this.cerrarChat();
    
    // Navegar al perfil
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

  getUserId(): number {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
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
    if (!fecha) return '';
    
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    // Si es hoy, mostrar solo la hora
    if (date.toDateString() === hoy.toDateString()) {
      return date.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } 
    // Si fue ayer
    else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } 
    // Si fue esta semana
    else if ((hoy.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('es-CL', { 
        weekday: 'short' 
      });
    }
    // Fecha más antigua
    else {
      return date.toLocaleDateString('es-CL', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }

  formatearHoraMensaje(fecha?: string): string {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}