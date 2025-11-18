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
  IonBadge,       // ⬅️ AGREGAR
  IonText,        // ⬅️ AGREGAR
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  createOutline,
  checkmarkOutline,
  closeOutline,
  arrowBackOutline,         // ⬅️ AGREGAR
  checkmarkCircleOutline,   // ⬅️ AGREGAR
  closeCircleOutline        // ⬅️ AGREGAR
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

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
    IonBadge,        // ⬅️ AGREGAR
    IonText,         // ⬅️ AGREGAR
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
    carrera: 'Ingeniería en Informática'  // ⬅️ Campo adicional
  };

  userBackup: any = {}; // Para cancelar edición
  editMode = false;

  constructor(
    private authService: AuthService,
    private toastController: ToastController
  ) {
    addIcons({
      homeOutline,
      createOutline,
      checkmarkOutline,
      closeOutline,
      arrowBackOutline,
      checkmarkCircleOutline,
      closeCircleOutline
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        console.log('Respuesta del perfil:', res); // ⬅️ DEBUG
        if (res && res.success) {
          this.user = { ...this.user, ...res.data }; // Combinar con datos del servidor
        }
      },
      error: (err) => {
        console.error("Error cargando perfil:", err);
      }
    });
  }

  activarModoEdicion() {
    this.editMode = true;
    this.userBackup = { ...this.user }; // Copiar datos para poder cancelar
  }

  cancelarEdicion() {
    this.user = { ...this.userBackup }; // Restaurar datos originales
    this.editMode = false;
  }

  async guardarCambios() {
    // Preparar datos para enviar
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

        // Recargar perfil
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
