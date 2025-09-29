import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; // ← AGREGAR ESTA LÍNEA
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar, 
  IonButtons 
} from '@ionic/angular/standalone';

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
    CommonModule,
    FormsModule,
    RouterLink, // ← AGREGAR ESTA LÍNEA
  ],
})
export class PerfilPage implements OnInit {
  constructor() {}
  ngOnInit() {}
}