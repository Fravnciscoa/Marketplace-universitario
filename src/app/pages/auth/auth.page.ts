import { Component, signal } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {
  mode = signal<'login' | 'register'>('login');

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        rut: ['', [Validators.required, this.rutValidator]],
        email: ['', [Validators.required, Validators.email]],
        region: ['', Validators.required],
        comuna: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm: ['', [Validators.required]],
        acceptTerms: [false, Validators.requiredTrue],
      },
      { validators: this.matchPasswords('password', 'confirm') },
    );
  }

  onModeChange(ev: CustomEvent) {
    const value = (ev.detail as any).value as 'login' | 'register';
    this.mode.set(value);
  }

  // ---- VALIDADORES ----
  rutValidator(control: AbstractControl): ValidationErrors | null {
    const v = (control.value || '').toString().trim();
    const re = /^(\d{1,2}\.?\d{3}\.?\d{3})-([\dkK])$/; // plausible
    return v === '' || re.test(v) ? null : { rutFormat: true };
  }

  matchPasswords(passKey: string, confirmKey: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const pass = group.get(passKey)?.value;
      const confirm = group.get(confirmKey)?.value;
      if (pass && confirm && pass !== confirm) {
        group.get(confirmKey)?.setErrors({ mismatch: true });
        return { passwordMismatch: true };
      }
      return null;
    };
  }

  // Utilidad de template
  invalid(form: FormGroup, controlName: string): boolean {
    const c = form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  // ---- TOAST ----
  private async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
    });
    await toast.present();
  }

  // ---- SUBMITS ----
  async submitLogin() {
    if (this.loginForm.invalid) return;

    const { identifier, password } = this.loginForm.value;
    this.authService
      .login({ usuario: identifier, contrasena: password })
      .subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.token);
          this.presentToast('✅ Login exitoso');
          this.router.navigateByUrl('/home');
        },
        error: (err: any) => {
          console.error('[AUTH] Error en login:', err);
          this.presentToast('❌ Usuario o contraseña incorrectos');
        },
      });
  }

  async submitRegister() {
    if (this.registerForm.invalid) return;

    const formData = this.registerForm.value;
    this.authService
      .register({
        nombre: formData.username,
        usuario: formData.username,
        correo: formData.email,
        contrasena: formData.password,
        rut: formData.rut,
        region: formData.region,
        comuna: formData.comuna,
        terminos_aceptados: formData.acceptTerms,
      })
      .subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.token);
          this.presentToast('✅ Registro exitoso');
          this.router.navigateByUrl('/home');
        },
        error: (err: any) => {
          console.error('[AUTH] Error en registro:', err);
          this.presentToast('❌ El usuario o email ya existe');
        },
      });
  }
}
