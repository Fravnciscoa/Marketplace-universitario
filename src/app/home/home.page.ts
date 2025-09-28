import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonSearchbar, IonGrid, IonRow, IonCol,
  IonSegment, IonSegmentButton, IonLabel, IonInput  // ⟵ agrega IonSegment e IonInput acá
} from '@ionic/angular/standalone';
import { ProductosService } from 'src/app/services/productos.service';
import { Producto } from 'src/app/models/producto.model';
import { TitleCasePipe, DecimalPipe, NgFor, NgIf } from '@angular/common'; // ⟵ NgIf opcional
import { FormsModule } from '@angular/forms';

type Estado = 'todos' | 'venta' | 'intercambio' | 'prestamo';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    FormsModule, DecimalPipe, TitleCasePipe, NgFor, NgIf,
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonGrid, IonRow, IonCol,
    IonSegment, IonSegmentButton, IonLabel, IonInput // ⟵ aquí también
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

  private aplicarFiltros(q: string) {
    const query = q?.toLowerCase() ?? '';
    this.visibles = this.productos.filter(p => {
      const okQuery = !query || p.titulo.toLowerCase().includes(query);
      const okEstado = this.estadoSel === 'todos' ? true : p.estado === this.estadoSel;
      const okMin = this.minPrecio == null ? true : p.precio >= this.minPrecio;
      const okMax = this.maxPrecio == null ? true : p.precio <= this.maxPrecio;
      return okQuery && okEstado && okMin && okMax;
    });
  }

  onEstadoChange(ev: Event) {
  const value = (ev as CustomEvent).detail?.value; // SegmentValue | undefined
  // Normaliza a string y valida contra tu unión:
  const raw = value == null ? 'todos' : String(value);
  const opciones = ['todos', 'venta', 'intercambio', 'prestamo'] as const;
  const safe = opciones.includes(raw as any) ? (raw as typeof opciones[number]) : 'todos';
  this.estadoSel = safe;
  this.aplicarFiltros('');
}


  onPrecioChange() {
    const toNum = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v));
    this.minPrecio = toNum(this.minPrecio);
    this.maxPrecio = toNum(this.maxPrecio);
    this.aplicarFiltros('');
  }

  // (opcional) mejor perf en *ngFor
  trackById = (_: number, p: Producto) => (p as any).id ?? p.titulo;
}
