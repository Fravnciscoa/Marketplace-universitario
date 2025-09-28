import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonSearchbar, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { ProductosService } from 'src/app/services/productos.service';
import { Producto } from 'src/app/models/producto.model';
import { TitleCasePipe, DecimalPipe, NgFor } from '@angular/common'; // ⟵ AQUI

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [    DecimalPipe, TitleCasePipe, NgFor, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonGrid, IonRow, IonCol],
})
export class HomePage {
  productos: Producto[] = [];
  visibles: Producto[] = [];

  constructor(private productosSvc: ProductosService) {
    this.productos = this.productosSvc.list();
    this.visibles = this.productos;
  }
  onSearch(ev: Event) {
    const q = (ev as CustomEvent).detail?.value?.toString().trim().toLowerCase() ?? '';
    // Por ahora, solo log para validar; luego conectamos con mocks/servicio.
    console.log('[home] search query:', q);
    this.visibles = !q
      ? this.productos
      : this.productos.filter(p => p.titulo.toLowerCase().includes(q));
  }
}

