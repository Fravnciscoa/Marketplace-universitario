import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, save, copy, shareOutline, checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonModal,
    IonInput,
    IonItem,
    IonLabel,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class PerfilPage implements OnInit {
  // Control de modales
  isModalOpen = false;
  isShareModalOpen = false;
  
  // Link del perfil y estado de copiado
  profileLink = '';
  copySuccess = false;
  
  // Datos del usuario
  user = {
    nombre: 'Francisco Castro',
    email: 'watyusei123@gmail.com',
    genero: 'Masculino',
    fechaNacimiento: 'Noviembre 6, 2001',
    telefono1: '(+56) 1 7821 4869',
    telefono2: '(+56) 1 7821 4869',
    direccion: 'Guaytu sei, 0225, Limache, V región',
  };

  constructor() {
    // Registrar los iconos que vamos a usar
    addIcons({ close, save, copy, shareOutline, checkmarkCircle });
  }

  ngOnInit() {
    // Generar el link del perfil basado en la URL actual
    this.profileLink = `${window.location.origin}/perfil`;
  }

  // ============================================
  // Métodos para Modal de Edición
  // ============================================
  
  openEditModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveProfile() {
    console.log('Perfil guardado:', this.user);
    // Aquí puedes agregar la lógica para guardar en el backend
    this.closeModal();
  }

  // ============================================
  // Métodos para Modal de Compartir
  // ============================================
  
  openShareModal() {
    this.isShareModalOpen = true;
    this.copySuccess = false;
  }

  closeShareModal() {
    this.isShareModalOpen = false;
    this.copySuccess = false;
  }

  async copyProfileLink() {
    try {
      await navigator.clipboard.writeText(this.profileLink);
      this.copySuccess = true;
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    } catch (err) {
      console.error('Error al copiar el enlace:', err);
      alert('No se pudo copiar el enlace');
    }
  }
}