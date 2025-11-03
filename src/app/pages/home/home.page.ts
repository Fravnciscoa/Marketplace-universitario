import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonCheckbox,
  IonRange,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonLabel,
  IonItem,
  IonList, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  filterOutline,
  cartOutline,
  heartOutline,
  chevronDownOutline,
  closeOutline,
} from 'ionicons/icons';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';

interface FiltroRango {
  lower: number;
  upper: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonButtons, 
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonButton,
    IonIcon,
    IonCheckbox,
    IonRange,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonLabel,
    IonItem,
    IonList,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class HomePage implements OnInit {
  mostrarFiltros = true;
  terminoBusqueda = '';

  tipoServicioFiltros = {
    comprar: false,
    reservar: false,
  };

  categoriaFiltros = {
    libros: false,
    electronica: false,
    deportes: false,
  };

  rangoPrecio: FiltroRango = {
    lower: 5000,
    upper: 500000,
  };

  precioMin = 5000;
  precioMax = 500000;

  campusFiltros = {
    isabelBrown: false,
    casaCentral: false,
    curauma: false,
  };

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  constructor(private productosService: ProductosService) {
    addIcons({
      searchOutline,
      filterOutline,
      cartOutline,
      heartOutline,
      chevronDownOutline,
      closeOutline,
    });
  }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    console.log('🔥 Cargando productos desde el backend...');
    
    this.productosService.getProductos().subscribe({
      next: (data) => {
        console.log('✅ Productos recibidos:', data);
        this.productos = data;
        this.aplicarFiltros();
        console.log('✅ Productos filtrados:', this.productosFiltrados.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
      }
    });
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter(producto => {
      const coincideBusqueda = this.terminoBusqueda === '' ||
        producto.titulo.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(this.terminoBusqueda.toLowerCase());

      const categoriaSeleccionada = Object.values(this.categoriaFiltros).some(v => v);
      const coincideCategoria = !categoriaSeleccionada ||
        this.categoriaFiltros[producto.categoria as keyof typeof this.categoriaFiltros];

      const coincidePrecio = producto.precio >= this.rangoPrecio.lower &&
        producto.precio <= this.rangoPrecio.upper;

      const campusSeleccionado = Object.values(this.campusFiltros).some(v => v);
      const coincideCampus = !campusSeleccionado ||
        this.campusFiltros[producto.campus as keyof typeof this.campusFiltros];

      return coincideBusqueda && coincideCategoria && coincidePrecio && coincideCampus;
    });
  }

  onBusquedaChange(event: any) {
    this.terminoBusqueda = event.detail.value || '';
    this.aplicarFiltros();
  }

  onRangoPrecioChange(event: any) {
    this.rangoPrecio = event.detail.value;
    this.aplicarFiltros();
  }

  onFiltroChange() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.tipoServicioFiltros = {
      comprar: false,
      reservar: false,
    };

    this.categoriaFiltros = {
      libros: false,
      electronica: false,
      deportes: false,
    };

    this.rangoPrecio = {
      lower: this.precioMin,
      upper: this.precioMax,
    };

    this.campusFiltros = {
      isabelBrown: false,
      casaCentral: false,
      curauma: false,
    };

    this.aplicarFiltros();
  }

  formatearPrecio(precio: number): string {
    return precio === 0 ? '$0' : `$${precio.toLocaleString('es-CL')}`;
  }

  formatearRangoPrecio(valor: number): string {
    return `$${(valor / 1000).toFixed(0)}.000`;
  }
}
