import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Component, signal } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
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
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AuthPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

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
    console.log('[AUTH] login submit', this.loginForm.value);
    await this.presentToast('Login OK (mock). Redirigiendo…');
    this.router.navigateByUrl('/perfil');
  }

  async submitRegister() {
    if (this.registerForm.invalid) return;
    console.log('[AUTH] register submit', this.registerForm.value);
    await this.presentToast('Registro OK (mock). Redirigiendo…');
    this.router.navigateByUrl('/perfil');
  }

  private async presentToast(message: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 1200,
      position: 'bottom',
    });
    await t.present();
  }
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class AuthPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
