import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Ionic standalone imports según tu template:
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';

type Estado = 'todos' | 'venta' | 'intercambio' | 'prestamo';

interface Producto {
  id: number;
  titulo: string;
  precio: number; // CLP
  estado: Exclude<Estado, 'todos'>;
  categoria: 'Libros' | 'Electrónica' | 'Deportes' | 'Otros';
  campus: 'Isabel Brown Caces' | 'Casa Central' | 'Curauma';
  img?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonSearchbar,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent
],
})
export class HomePage {
  // ------- Estado UI -------
  estadoSel: Estado = 'todos';
  searchTerm = '';
  minPrecio = 0;
  maxPrecio = 500_000;

  // ------- Datos demo (reemplaza por tu servicio/API) -------
  private productos: Producto[] = [
    {
      id: 1,
      titulo: 'Calculadora',
      precio: 10_000,
      estado: 'venta',
      categoria: 'Electrónica',
      campus: 'Casa Central',
      img: 'src\assets\demo\calculadora.jpegs/img/demo/calculadora.jpg',
    },
    {
      id: 2,
      titulo: 'Lógica de programación',
      precio: 5_000,
      estado: 'venta',
      categoria: 'Libros',
      campus: 'Curauma',
      img: 'assets/img/demo/libro-logica.jpg',
    },
    {
      id: 3,
      titulo: 'Bicicleta usada',
      precio: 100_000,
      estado: 'venta',
      categoria: 'Deportes',
      campus: 'Isabel Brown Caces',
      img: 'assets/img/demo/bici.jpg',
    },
    {
      id: 4,
      titulo: 'Mochila',
      precio: 20_000,
      estado: 'venta',
      categoria: 'Otros',
      campus: 'Casa Central',
      img: 'assets/img/demo/mochila.jpg',
    },
    {
      id: 5,
      titulo: 'Kit Carpintería',
      precio: 8_000,
      estado: 'intercambio',
      categoria: 'Otros',
      campus: 'Curauma',
      img: 'assets/img/demo/kit.jpg',
    },
    {
      id: 6,
      titulo: 'Póster Cohete',
      precio: 7_000,
      estado: 'venta',
      categoria: 'Otros',
      campus: 'Casa Central',
      img: 'assets/img/demo/cohete.jpg',
    },
    {
      id: 7,
      titulo: 'Kayak',
      precio: 120_000,
      estado: 'prestamo',
      categoria: 'Deportes',
      campus: 'Isabel Brown Caces',
      img: 'assets/img/demo/kayak.jpg',
    },
  ];

  // ------- Derivado (se recalcula al leer) -------
  get visibles(): Producto[] {
    const term = this.searchTerm.trim().toLowerCase();
    const est = this.estadoSel;
    const min = Number.isFinite(this.minPrecio) ? this.minPrecio : 0;
    const max =
      Number.isFinite(this.maxPrecio) && this.maxPrecio > 0
        ? this.maxPrecio
        : Number.MAX_SAFE_INTEGER;

    return this.productos.filter((p) => {
      const okTerm = !term || p.titulo.toLowerCase().includes(term);
      const okEstado = est === 'todos' || p.estado === est;
      const okPrecio = p.precio >= min && p.precio <= max;
      return okTerm && okEstado && okPrecio;
    });
  }

  // ------- Handlers -------
  onSearch(ev: any) {
    this.searchTerm = ev?.detail?.value ?? '';
  }

  onEstadoChange(ev: any) {
    const val = (ev?.detail?.value ?? 'todos') as string;
    const allowed: Estado[] = ['todos', 'venta', 'intercambio', 'prestamo'];
    this.estadoSel = (allowed as string[]).includes(val)
      ? (val as Estado)
      : 'todos';
  }

  onPrecioChange() {
    // No hace nada más: el getter `visibles` ya usa min/max y se re-renderiza.
  }

  trackById = (_: number, p: Producto) => p.id;
}
