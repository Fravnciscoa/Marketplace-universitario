import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonButtons,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonList,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  createOutline,
  checkmarkOutline,
  closeOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  receiptOutline,
  timeOutline,
  cardOutline,
  cartOutline,
  locationOutline,
  cubeOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { PedidosService } from '../../services/pedidos.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonButtons,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonBadge,
    IonText,
    IonSegment,
    IonSegmentButton,
    IonList,
    IonSpinner,
    CommonModule,
    RouterLink,
    FormsModule
  ],
})
export class PerfilPage implements OnInit {
  user: any = {
    nombre: '',
    correo: '',
    usuario: '',
    rut: '',
    region: '',
    comuna: '',
    genero: '',
    fecha_nacimiento: '',
    telefono1: '',
    telefono2: '',
    direccion: '',
    carrera: 'Ingeniería en Informática'
  };

  userBackup: any = {};
  editMode = false;
  
  // Variables para pedidos
  selectedSegment = 'info';
  pedidos: any[] = [];
  loadingPedidos = false;

  constructor(
    public authService: AuthService,
    private pedidosService: PedidosService,
    private toastController: ToastController
  ) {
    addIcons({
      homeOutline,
      createOutline,
      checkmarkOutline,
      closeOutline,
      arrowBackOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      receiptOutline,
      timeOutline,
      cardOutline,
      cartOutline,
      locationOutline,
      cubeOutline
    });
  }

  ngOnInit() {
    this.loadProfile();
    this.loadPedidos();
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.user = { ...this.user, ...res.data };
        }
      },
      error: (err) => {
        console.error("Error cargando perfil:", err);
      }
    });
  }

  loadPedidos() {
    this.loadingPedidos = true;
    this.pedidosService.obtenerMisPedidos().subscribe({
      next: (response) => {
        if (response.success) {
          this.pedidos = response.data;
        }
        this.loadingPedidos = false;
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.loadingPedidos = false;
      }
    });
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  getEstadoBadgeColor(estado: string): string {
    const colores: any = {
      'pendiente': 'warning',
      'confirmado': 'primary',
      'enviado': 'secondary',
      'completado': 'success',
      'cancelado': 'danger'
    };
    return colores[estado] || 'medium';
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  activarModoEdicion() {
    this.editMode = true;
    this.userBackup = { ...this.user };
  }

  cancelarEdicion() {
    this.user = { ...this.userBackup };
    this.editMode = false;
  }

  async guardarCambios() {
    const dataToUpdate = {
      nombre: this.user.nombre,
      rut: this.user.rut,
      region: this.user.region,
      comuna: this.user.comuna,
      genero: this.user.genero,
      fecha_nacimiento: this.user.fecha_nacimiento,
      telefono1: this.user.telefono1,
      telefono2: this.user.telefono2,
      direccion: this.user.direccion
    };

    this.authService.updateProfile(dataToUpdate).subscribe({
      next: async (response) => {
        this.editMode = false;
        
        const toast = await this.toastController.create({
          message: '✅ Perfil actualizado correctamente',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        this.loadProfile();
      },
      error: async (error) => {
        console.error('Error al actualizar perfil:', error);
        
        const toast = await this.toastController.create({
          message: '❌ Error al actualizar perfil. Intenta nuevamente.',
          duration: 2000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }
}
