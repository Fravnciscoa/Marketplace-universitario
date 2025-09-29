import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Auth</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p>Auth page shell ✅</p>
      <ion-button routerLink="/" fill="outline" size="small"
        >Ir a Home</ion-button
      >
    </ion-content>
  `,
})
export class AuthPage {}
