import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewWillEnter } from '@ionic/angular'; // ← Agregar este import
import { Router, RouterLink } from '@angular/router';
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
  IonList,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  filterOutline,
  cartOutline,
  heartOutline,
  chevronDownOutline,
  closeOutline,
  logInOutline,
  logOutOutline,
  personOutline,
  addOutline,
} from 'ionicons/icons';
import { ProductosService, Producto } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';

interface FiltroRango {
  lower: number;
  upper: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
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
    RouterLink,   // 👈 SO-LO este RouterLink (de @angular/router)
  ],
})
export class HomePage implements OnInit {
  isLoggedIn = false;
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

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      searchOutline,
      filterOutline,
      cartOutline,
      heartOutline,
      chevronDownOutline,
      closeOutline,
      logInOutline,
      logOutOutline,
      personOutline,
      addOutline,
    });
  }

  ngOnInit() {
    // Suscribirse al estado de autenticación
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });
  }

  // ← NUEVO: Mover la carga de productos aquí
  ionViewWillEnter() {
    this.cargarProductos();
  }

  cargarProductos() {
  console.log('🔥 Cargando productos desde el backend...');
  this.productosService.getProductos().subscribe({
    next: (res: any) => {
      console.log('📦 Respuesta completa del backend:', res);

      // Extraemos productos correctamente
      this.productos = res.data;

      this.aplicarFiltros();
      console.log('🎯 Productos luego del filtro:', this.productosFiltrados.length);
    },
    error: (err) => {
      console.error('❌ Error al cargar productos:', err);
    },
  });
}


  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter((producto) => {
      const coincideBusqueda =
        this.terminoBusqueda === '' ||
        producto.titulo.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(this.terminoBusqueda.toLowerCase());

      const categoriaSeleccionada = Object.values(this.categoriaFiltros).some((v) => v);
      const coincideCategoria =
        !categoriaSeleccionada ||
        this.categoriaFiltros[producto.categoria as keyof typeof this.categoriaFiltros];

      const coincidePrecio =
        producto.precio >= this.rangoPrecio.lower && producto.precio <= this.rangoPrecio.upper;

      const campusSeleccionado = Object.values(this.campusFiltros).some((v) => v);
      const coincideCampus =
        !campusSeleccionado ||
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
