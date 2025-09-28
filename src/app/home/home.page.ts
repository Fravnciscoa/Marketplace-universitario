import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonSearchbar, IonGrid, IonRow, IonCol,
  IonSegment, IonSegmentButton, IonLabel, IonInput
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, TitleCasePipe, NgFor, NgIf } from '@angular/common';
import { ProductosService } from 'src/app/services/productos.service';
import { Producto } from 'src/app/models/producto.model';

type Estado = 'todos' | 'venta' | 'intercambio' | 'prestamo';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    // Angular
    FormsModule, DecimalPipe, TitleCasePipe, NgFor, NgIf,
    // Ionic (standalone)
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonSearchbar, IonGrid, IonRow, IonCol,
    IonSegment, IonSegmentButton, IonLabel, IonInput
  ],
})
export class HomePage {
  productos: Producto[] = [];
  visibles: Producto[] = [];

  estadoSel: Estado = 'todos';
  minPrecio: number | null = null;
  maxPrecio: number | null = null;

  constructor(private productosSvc: ProductosService) {
    this.productos = this.productosSvc.list();
    this.visibles = this.productos;
  }

  onSearch(ev: Event) {
    const q = (ev as CustomEvent).detail?.value?.toString().trim().toLowerCase() ?? '';
    this.aplicarFiltros(q);
  }

  onEstadoChange(ev: Event) {
    const raw = (ev as CustomEvent<{ value: string | number | null | undefined }>).detail?.value;
    const asString = raw == null ? 'todos' : String(raw);
    const opciones = ['todos', 'venta', 'intercambio', 'prestamo'] as const;
    const safe: Estado = (opciones as readonly string[]).includes(asString) ? (asString as Estado) : 'todos';
    this.estadoSel = safe;
    this.aplicarFiltros('');
  }

  onPrecioChange() {
    const toNum = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v));
    this.minPrecio = toNum(this.minPrecio);
    this.maxPrecio = toNum(this.maxPrecio);
    this.aplicarFiltros('');
  }

  private aplicarFiltros(q: string) {
    const query = q?.toLowerCase() ?? '';
    this.visibles = this.productos.filter(p => {
      const okQuery = !query || p.titulo.toLowerCase().includes(query);
      const okEstado = this.estadoSel === 'todos' ? true : p.estado.toLowerCase() === this.estadoSel;
      const okMin = this.minPrecio == null ? true : p.precio >= this.minPrecio;
      const okMax = this.maxPrecio == null ? true : p.precio <= this.maxPrecio;
      return okQuery && okEstado && okMin && okMax;
    });
  }

  trackById = (_: number, p: Producto) => (p as any).id ?? p.titulo;
}
