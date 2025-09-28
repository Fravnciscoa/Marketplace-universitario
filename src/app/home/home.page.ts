import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSearchbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent],
})
export class HomePage {
  constructor() {}
  onSearch(ev: Event) {
    const q = (ev as CustomEvent).detail?.value?.toString().trim() ?? '';
    // Por ahora, solo log para validar; luego conectamos con mocks/servicio.
    console.log('[home] search query:', q);
  }
}

