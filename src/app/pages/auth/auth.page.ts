import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonInput,
  IonButton,
  IonCheckbox,
  IonSelect,
  IonSelectOption,
  ToastController,
  AlertController, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonIcon, 
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonItem,
    IonInput,
    IonButton,
    IonCheckbox,
    IonSelect,
    IonSelectOption
  ]
})
export class AuthPage {
  segment: 'login' | 'register' = 'login';
  loading = false;

  // Login form
  loginData = {
    correo: '',
    contrasena: ''
  };

  // Register form
  registerData = {
    nombre: '',
    correo: '',
    usuario: '',
    contrasena: '',
    confirmarContrasena: '',
    rut: '',
    region: '',
    comuna: '',
    terminos_aceptados: false
  };

  regiones = [
    'Arica y Parinacota',
    'Tarapacá',
    'Antofagasta',
    'Atacama',
    'Coquimbo',
    'Valparaíso',
    'Metropolitana',
    'O\'Higgins',
    'Maule',
    'Ñuble',
    'Biobío',
    'Araucanía',
    'Los Ríos',
    'Los Lagos',
    'Aysén',
    'Magallanes'
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/home']);
    }
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
  }

  async onLogin() {
    if (!this.loginData.correo || !this.loginData.contrasena) {
      await this.showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    this.loading = true;

    this.authService.login(this.loginData).subscribe({
      next: async (response) => {
        this.loading = false;
        await this.showToast(`¡Bienvenido ${response.user.nombre}!`, 'success');
        this.router.navigate(['/home']);
      },
      error: async (error) => {
        this.loading = false;
        const mensaje = error.error?.error || 'Error al iniciar sesión';
        await this.showToast(mensaje, 'danger');
      }
    });
  }

  async onRegister() {
    if (!this.registerData.nombre || !this.registerData.correo || 
        !this.registerData.usuario || !this.registerData.contrasena ||
        !this.registerData.rut || !this.registerData.region || !this.registerData.comuna) {
      await this.showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    if (this.registerData.contrasena !== this.registerData.confirmarContrasena) {
      await this.showToast('Las contraseñas no coinciden', 'warning');
      return;
    }

    if (this.registerData.contrasena.length < 6) {
      await this.showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    if (!this.registerData.terminos_aceptados) {
      await this.showToast('Debes aceptar los términos y condiciones', 'warning');
      return;
    }

    const correoPUCV = this.registerData.correo.toLowerCase();
    if (!correoPUCV.includes('@pucv.cl') && !correoPUCV.includes('@mail.pucv.cl')) {
      await this.showToast('Debes usar un correo institucional PUCV', 'warning');
      return;
    }

    this.loading = true;

    const { confirmarContrasena, ...dataToSend } = this.registerData;

    this.authService.register(dataToSend).subscribe({
      next: async (response) => {
        this.loading = false;
        await this.showToast(`¡Cuenta creada exitosamente! Bienvenido ${response.user.nombre}`, 'success');
        this.router.navigate(['/home']);
      },
      error: async (error) => {
        this.loading = false;
        const mensaje = error.error?.error || 'Error al registrar usuario';
        await this.showToast(mensaje, 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  async showTerminos() {
    const alert = await this.alertController.create({
      header: 'Términos y Condiciones',
      message: `
        <p><strong>Marketplace Universitario PUCV</strong></p>
        <ul>
          <li>Solo estudiantes PUCV pueden registrarse</li>
          <li>Debes usar tu correo institucional</li>
          <li>Eres responsable de los productos que publiques</li>
          <li>No está permitida la venta de productos ilegales</li>
          <li>Respeta a los demás usuarios</li>
        </ul>
      `,
      buttons: ['Cerrar']
    });
    await alert.present();
  }
}
