import { Component, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class AuthPage implements OnInit {
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

  ngOnInit(): void {}
}
