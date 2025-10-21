import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonInput,
  IonItem,
  IonList,
  IonCheckbox,
  IonRange,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  searchOutline,
  funnelOutline,
  pricetagOutline,
  logInOutline,
  personAddOutline,
} from 'ionicons/icons';

type Estado = 'todos' | 'venta' | 'intercambio' | 'prestamo';
type Categoria = 'Libros' | 'Electrónica' | 'Deportes';

interface Producto {
  id: number;
  titulo: string;
  precio: number; // 0 = Gratis
  estado: Exclude<Estado, 'todos'>;
  categoria: Categoria;
  campus: 'Isabel Brown Cases' | 'Casa Central' | 'Curauma';
  img: string; // ruta en /assets
}

addIcons({
  searchOutline,
  funnelOutline,
  pricetagOutline,
  logInOutline,
  personAddOutline,
});

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonInput,
    IonItem,
    IonList,
    IonCheckbox,
    IonRange,
  ],
})
export class HomePage implements OnInit {
  // --- Estado UI ---
  q = signal<string>('');
  estadoSel = signal<Estado>('todos');
  minPrecio = signal<number>(0);
  maxPrecio = signal<number>(500000);

  cats = signal<Record<Categoria, boolean>>({
    Libros: true,
    Electrónica: true,
    Deportes: true,
  });

  campus = signal<Record<Producto['campus'], boolean>>({
    'Isabel Brown Cases': true,
    'Casa Central': true,
    Curauma: true,
  });

  // --- Datos demo (reemplaza por tu fetch) ---
  productos = signal<Producto[]>([
    {
      id: 1,
      titulo: 'Calculadora',
      precio: 10000,
      estado: 'venta',
      categoria: 'Electrónica',
      campus: 'Casa Central',
      img: 'assets/demo/calculadora.jpg',
    },
    {
      id: 2,
      titulo: 'Lógica de programación',
      precio: 5000,
      estado: 'venta',
      categoria: 'Libros',
      campus: 'Curauma',
      img: 'assets/demo/libro.jpg',
    },
    {
      id: 3,
      titulo: 'Bicicleta usada',
      precio: 100000,
      estado: 'venta',
      categoria: 'Deportes',
      campus: 'Isabel Brown Cases',
      img: 'assets/demo/bici.jpg',
    },
    {
      id: 4,
      titulo: 'Mochila',
      precio: 20000,
      estado: 'venta',
      categoria: 'Deportes',
      campus: 'Casa Central',
      img: 'assets/demo/mochila.jpg',
    },
  ]);

  // --- Filtro computado ---
  visibles = computed(() => {
    const q = this.q().trim().toLowerCase();
    const est = this.estadoSel();
    const min = this.minPrecio();
    const max = this.maxPrecio();
    const okCat = this.cats();
    const okCampus = this.campus();
    return this.productos().filter((p) => {
      const byQ = !q || p.titulo.toLowerCase().includes(q);
      const byE = est === 'todos' ? true : p.estado === est;
      const byP = p.precio >= min && p.precio <= max;
      const byC = okCat[p.categoria];
      const byCampus = okCampus[p.campus];
      return byQ && byE && byP && byC && byCampus;
    });
  });

  // --- Handlers ---
  onSearch(ev: CustomEvent) {
    this.q.set((ev.detail as any).value || '');
  }
  onEstadoChange(ev: CustomEvent) {
    this.estadoSel.set((ev.detail as any).value as Estado);
  }
  onPrecioRange(ev: CustomEvent) {
    const { lower, upper } = (ev.detail as any).value ?? {};
    if (typeof lower === 'number') this.minPrecio.set(lower);
    if (typeof upper === 'number') this.maxPrecio.set(upper);
  }
  toggleCat(k: Categoria, checked: boolean) {
    this.cats.set({ ...this.cats(), [k]: checked });
  }
  toggleCampus(k: Producto['campus'], checked: boolean) {
    this.campus.set({ ...this.campus(), [k]: checked });
  }
  trackById = (_: number, p: Producto) => p.id;

  constructor() {}

  ngOnInit() {}
}
