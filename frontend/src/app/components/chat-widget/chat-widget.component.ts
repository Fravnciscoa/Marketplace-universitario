import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor(public chatService: ChatService) {}

  ngOnInit() {
    const contadorSub = this.chatService.contadorNoLeidos$.subscribe((total) => {
      this.totalNoLeidos = total;
    });
    this.subscriptions.push(contadorSub);

    const mensajesSub = this.chatService.onNuevoMensaje().subscribe((msg) => {
      if (this.conversacionActiva && msg.conversacion_id === this.conversacionActiva.id) {
        this.mensajes.push(msg);
        this.shouldScrollToBottom = true;
      } else {
        if (this.abierto && this.vistaActual === 'conversaciones') {
          this.cargarConversaciones();
        }
      }
    });
    this.subscriptions.push(mensajesSub);

    const typingSub = this.chatService.onUserTyping().subscribe((data) => {
      if (this.conversacionActiva && data.usuarioId !== this.getUserId()) {
        this.otroUsuarioEscribiendo = data.isTyping;
        if (data.isTyping) {
          setTimeout(() => {
            this.otroUsuarioEscribiendo = false;
          }, 3000);
        }
      }
    });
    this.subscriptions.push(typingSub);

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

  toggleChat() {
    this.abierto = !this.abierto;
    if (this.abierto) {
      this.vistaActual = 'conversaciones';
      this.cargarConversaciones();
      this.chatService.actualizarContadorNoLeidos();
    } else {
      if (this.conversacionActiva) {
        this.chatService.leaveConversacion(this.conversacionActiva.id);
        this.conversacionActiva = null;
      }
      this.usuariosEncontrados = [];
      this.terminoBusqueda = '';
    }
  }

  cerrarChat() {
    this.abierto = false;
    if (this.conversacionActiva) {
      this.chatService.leaveConversacion(this.conversacionActiva.id);
      this.conversacionActiva = null;
    }
    this.vistaActual = 'conversaciones';
    this.usuariosEncontrados = [];
    this.terminoBusqueda = '';
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

  // === Conversaciones ===
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

    this.chatService.marcarConversacionLeida(conv.id).subscribe({
      next: () => {
        conv.mensajes_no_leidos = 0;
        this.chatService.actualizarContadorNoLeidos();
      }
    });
  }

  // === Mensajes ===
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

    this.chatService.emitTyping(this.conversacionActiva.id, false);

    this.chatService.enviarMensaje(this.conversacionActiva.id, texto).subscribe({
      next: () => {
        this.enviandoMensaje = false;
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.enviandoMensaje = false;
        this.mensajeNuevo = texto;
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

  // === Buscar usuarios para iniciar chat ===
  // Reemplaza el método buscarUsuarios en chat-widget.component.ts

// === Buscar usuarios para iniciar chat ===
buscarUsuarios() {
  const term = this.terminoBusqueda.trim();
  
  // Limpiar resultados si el término es muy corto
  if (term.length < 3) {
    this.usuariosEncontrados = [];
    return;
  }
  
  this.buscandoUsuarios = true;
  
  this.chatService.buscarUsuarios(term).subscribe({
    next: (res) => {
      this.usuariosEncontrados = res.usuarios || [];
      this.buscandoUsuarios = false;
      
      // Log para debugging
      console.log('Usuarios encontrados:', this.usuariosEncontrados);
    },
    error: (err) => {
      console.error('Error al buscar usuarios:', err);
      this.usuariosEncontrados = [];
      this.buscandoUsuarios = false;
      
      // Opcional: Mostrar mensaje de error al usuario
      if (err.status === 401) {
        console.error('No autorizado. Por favor inicia sesión nuevamente.');
      }
    }
  });
}

  iniciarConversacion(usuario: Usuario) {
    this.chatService.obtenerOCrearConversacion(usuario.id).subscribe({
      next: (res) => {
        if (res.conversacion) {
          this.abrirConversacion(res.conversacion);
          this.usuariosEncontrados = [];
          this.terminoBusqueda = '';
        }
      }
    });
  }

  // Utilities
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

    if (date.toDateString() === hoy.toDateString()) {
      return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
    }
  }
}
