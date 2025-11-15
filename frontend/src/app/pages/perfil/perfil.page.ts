import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    RouterLink
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
    direccion: ''
  };

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.user = res.data;
        }
      },
      error: (err) => {
        console.error("Error cargando perfil:", err);
      }
    });
  }
}
