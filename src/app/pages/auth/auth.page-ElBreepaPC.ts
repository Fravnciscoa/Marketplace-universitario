import { Component, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Auth</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Conmutador Login / Registro -->
      <ion-segment
        [(ngModel)]="mode()"
        (ionChange)="onModeChange($event)"
        value="login"
      >
        <ion-segment-button value="login">
          <ion-label>Iniciar sesión</ion-label>
        </ion-segment-button>
        <ion-segment-button value="register">
          <ion-label>Registrarme</ion-label>
        </ion-segment-button>
      </ion-segment>

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

                <ion-item>
                  <ion-label position="stacked">Contraseña</ion-label>
                  <ion-input
                    type="password"
                    formControlName="password"
                    placeholder="********"
                  ></ion-input>
                </ion-item>
              </ion-list>

              <div class="actions">
                <ion-button type="submit" expand="block"
                  >Iniciar sesión</ion-button
                >
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

                <ion-item>
                  <ion-label position="stacked">RUT</ion-label>
                  <ion-input
                    formControlName="rut"
                    placeholder="12.345.678-5"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Correo</ion-label>
                  <ion-input
                    formControlName="email"
                    type="email"
                    placeholder="correo@dominio.cl"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Región</ion-label>
                  <ion-input
                    formControlName="region"
                    placeholder="Valparaíso"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Comuna</ion-label>
                  <ion-input
                    formControlName="comuna"
                    placeholder="Limache"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Contraseña</ion-label>
                  <ion-input
                    type="password"
                    formControlName="password"
                    placeholder="********"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Confirmar contraseña</ion-label>
                  <ion-input
                    type="password"
                    formControlName="confirm"
                    placeholder="********"
                  ></ion-input>
                </ion-item>

                <ion-item lines="none">
                  <ion-checkbox
                    formControlName="acceptTerms"
                    slot="start"
                  ></ion-checkbox>
                  <ion-label>Acepto los términos y condiciones</ion-label>
                </ion-item>
              </ion-list>

              <div class="actions">
                <ion-button type="submit" expand="block"
                  >Registrarme</ion-button
                >
              </div>
            </form>
          </ion-card-content>
        </ion-card>
      </ng-container>
    </ion-content>
  `,
  styles: [
    `
      .actions {
        margin-top: 12px;
      }
      ion-card {
        max-width: 520px;
        margin: 16px auto;
      }
    `,
  ],
})
export class AuthPage {
  // segment mode (login/register) como signal para template simple
  mode = signal<'login' | 'register'>('login');

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Esqueleto mínimo (sin validaciones aún)
    this.loginForm = this.fb.group({
      identifier: [''],
      password: [''],
    });

    this.registerForm = this.fb.group({
      username: [''],
      rut: [''],
      email: [''],
      region: [''],
      comuna: [''],
      password: [''],
      confirm: [''],
      acceptTerms: [false],
    });
  }

  onModeChange(ev: CustomEvent) {
    const value = (ev.detail as any).value as 'login' | 'register';
    this.mode.set(value);
  }

  submitLogin() {
    // solo mock/log por ahora
    console.log('[AUTH] login submit', this.loginForm.value);
  }

  submitRegister() {
    // solo mock/log por ahora
    console.log('[AUTH] register submit', this.registerForm.value);
  }
}
