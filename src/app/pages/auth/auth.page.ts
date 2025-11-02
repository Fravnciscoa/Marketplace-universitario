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
  template: `
    <ion-content class="ion-padding">
      <div class="auth-wrap">
        <!-- Tabs arriba (no centradas verticalmente) -->
        <ion-segment [value]="mode()" (ionChange)="onModeChange($event)">
          <ion-segment-button value="login">
            <ion-label>Iniciar sesión</ion-label>
          </ion-segment-button>
          <ion-segment-button value="register">
            <ion-label>Registrarme</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- SOLO el formulario centrado -->
        <div class="form-wrap">
          <!-- LOGIN -->
          <ng-container *ngIf="mode() === 'login'">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Acceso</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <form [formGroup]="loginForm" (ngSubmit)="submitLogin()">
                  <ion-list>
                    <ion-item>
                      <ion-label position="stacked"
                        >Usuario / RUT / Correo</ion-label
                      >
                      <ion-input
                        formControlName="identifier"
                        placeholder="tucorreo@dominio.cl"
                      ></ion-input>
                    </ion-item>
                    <ion-note
                      color="danger"
                      *ngIf="invalid(loginForm, 'identifier')"
                    >
                      Campo requerido (mín. 3 caracteres).
                    </ion-note>

                    <ion-item>
                      <ion-label position="stacked">Contraseña</ion-label>
                      <ion-input
                        type="password"
                        formControlName="password"
                        placeholder="********"
                      ></ion-input>
                    </ion-item>
                    <ion-note
                      color="danger"
                      *ngIf="invalid(loginForm, 'password')"
                    >
                      Requerida (mín. 6 caracteres).
                    </ion-note>
                  </ion-list>

                  <div class="actions">
                    <ion-button
                      type="submit"
                      expand="block"
                      [disabled]="loginForm.invalid"
                    >
                      Iniciar sesión
                    </ion-button>
                  </div>
                </form>
              </ion-card-content>
            </ion-card>
          </ng-container>

          <!-- REGISTRO -->
          <ng-container *ngIf="mode() === 'register'">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Crear cuenta</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <form [formGroup]="registerForm" (ngSubmit)="submitRegister()">
                  <ion-list>
                    <ion-item>
                      <ion-label position="stacked">Usuario</ion-label>
                      <ion-input
                        formControlName="username"
                        placeholder="Ej: sebastian"
                      ></ion-input>
                    </ion-item>
                    <ion-note
                      color="danger"
                      *ngIf="invalid(registerForm, 'username')"
                    >
                      Requerido (mín. 3 caracteres).
                    </ion-note>

                    <ion-item>
                      <ion-label position="stacked">RUT</ion-label>
                      <ion-input
                        formControlName="rut"
                        placeholder="12.345.678-5"
                      ></ion-input>
                    </ion-item>
                    <ion-note
                      color="danger"
                      *ngIf="invalid(registerForm, 'rut')"
                    >
                      Formato RUT plausible: 12.345.678-5 o 12345678-5.
                    </ion-note>

                    <ion-item>
                      <ion-label position="stacked">Correo</ion-label>
                      <ion-input
                        formControlName="email"
                        type="email"
                        placeholder="correo@dominio.cl"
                      ></ion-input>
                    </ion-item>
                    <ion-note
                      color="danger"
                      *ngIf="invalid(registerForm, 'email')"
                    >
                      Correo inválido.
                    </ion-note>

                    <ion-item>
                      <ion-label position="stacked">Región</ion-label>
                      <ion-input
                        formControlName="region"
                        placeholder="Valparaíso"
                      ></ion-input>
                    </ion-item>
                    <ion-note
                      color="danger"
                      *ngIf="invalid(registerForm, 'region')"
                    >
                      Requerida.
                    </ion-note>

                    <ion-item>
                      <ion-label position="stacked">Comuna</ion-label>
                      <ion-input
                        formControlName="comuna"
                        placeholder="Limache"
                      ></ion-input>
                    </ion-item>
                    <ion-note
                      color="danger"
                      *ngIf="invalid(registerForm, 'comuna')"
                    >
                      Requerida.
                    </ion-note>

                    <ion-item>
                      <ion-label position="stacked">Contraseña</ion-label>
                      <ion-input
                        type="password"
                        formControlName="password"
                        placeholder="********"
                      ></ion-input>
                    </ion-item>
                    <ion-note
                      color="danger"
                      *ngIf="invalid(registerForm, 'password')"
                    >
                      Requerida (mín. 6 caracteres).
                    </ion-note>

                    <ion-item>
                      <ion-label position="stacked"
                        >Confirmar contraseña</ion-label
                      >
                      <ion-input
                        type="password"
                        formControlName="confirm"
                        placeholder="********"
                      ></ion-input>
                    </ion-item>
                    <ion-note
                      color="danger"
                      *ngIf="
                        registerForm.hasError('passwordMismatch') &&
                        (registerForm.touched || registerForm.dirty)
                      "
                    >
                      Las contraseñas no coinciden.
                    </ion-note>

                    <ion-item lines="none">
                      <ion-checkbox
                        formControlName="acceptTerms"
                        slot="start"
                      ></ion-checkbox>
                      <ion-label>Acepto los términos y condiciones</ion-label>
                    </ion-item>
                    <ion-note
                      color="danger"
                      *ngIf="invalid(registerForm, 'acceptTerms')"
                    >
                      Debes aceptar los T&C.
                    </ion-note>
                  </ion-list>

                  <div class="actions">
                    <ion-button
                      type="submit"
                      expand="block"
                      [disabled]="registerForm.invalid"
                    >
                      Registrarme
                    </ion-button>
                  </div>
                </form>
              </ion-card-content>
            </ion-card>
          </ng-container>
        </div>
        <!-- /form-wrap -->
      </div>
      <!-- /auth-wrap -->
    </ion-content>
  `,
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
    private authService: AuthService,  // 🔥 AGREGA ESTA LÍNEA

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

  // ---- SUBMITS MOCK ----
  async submitLogin() {
  if (this.loginForm.invalid) return;

  const { identifier, password } = this.loginForm.value;
  
  console.log('[AUTH] Intentando login...');
  
  this.authService.login({
    usuario: identifier,
    contrasena: password
  }).subscribe({
    next: (response: any) => {
      console.log('[AUTH] Login exitoso:', response);
      localStorage.setItem('token', response.token);
      this.presentToast('✅ Login exitoso');
      this.router.navigateByUrl('/home');
    },
    error: (err: any) => {
      console.error('[AUTH] Error en login:', err);
      this.presentToast('❌ Usuario o contraseña incorrectos');
    }
  });
}
  presentToast(arg0: string) {
    throw new Error('Method not implemented.');
  }

async submitRegister() {
  if (this.registerForm.invalid) return;

  const formData = this.registerForm.value;
  
  console.log('[AUTH] Intentando registro...');
  
  this.authService.register({
    nombre: formData.username,
    usuario: formData.username,
    correo: formData.email,
    contrasena: formData.password,
    rut: formData.rut,
    region: formData.region,
    comuna: formData.comuna,
    terminos_aceptados: formData.acceptTerms
  }).subscribe({
    next: (response: any) => {
      console.log('[AUTH] Registro exitoso:', response);
      localStorage.setItem('token', response.token);
      this.presentToast('✅ Registro exitoso');
      this.router.navigateByUrl('/home');
    },
    error: (err: any) => {
      console.error('[AUTH] Error en registro:', err);
      this.presentToast('❌ El usuario o email ya existe');
    }
  });
}
}