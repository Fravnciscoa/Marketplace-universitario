import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
openShareModal() {
throw new Error('Method not implemented.');
}
openEditModal() {
throw new Error('Method not implemented.');
}
isModalOpen: any;
closeModal() {
throw new Error('Method not implemented.');
}

  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.user = this.authService.getCurrentUser();
  }
}