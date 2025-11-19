import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewWillEnter } from '@ionic/angular';
import { Router, RouterLink, ActivatedRoute } from '@angular/router'; // 👈 ACTIVATEDROUTE AÑADIDO
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
  cubeOutline,
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
    RouterLink,
  ],
})
export class HomePage implements OnInit {
  logout() {
    throw new Error('Method not implemented.');
  }

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
    lower: 0,
    upper: 999999,
  };

  precioMin = 0;
  precioMax = 100000000000;   // o un valor más alto

  campusFiltros = {
    isabelBrown: false,
    casaCentral: false,
    curauma: false,
  };

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  // 👇 NUEVO: para guardar la categoría que viene desde /categorias?categoria=...
  categoriaSeleccionada: string | null = null;

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // 👈 NUEVO
  ) {
    addIcons({
      searchOutline,
      filterOutline,
      cartOutline,
      cubeOutline,
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

    // 👇 NUEVO: escuchar la categoría que viene desde /categorias
    this.route.queryParamMap.subscribe((params) => {
      const cat = params.get('categoria');
      this.categoriaSeleccionada = cat;

      if (cat) {
        // Reseteamos filtros de categoría y marcamos solo la que viene
        this.categoriaFiltros = {
          libros: false,
          electronica: false,
          deportes: false,
        };

        if (cat === 'libros' || cat === 'electronica' || cat === 'deportes') {
          this.categoriaFiltros[cat] = true;
        }
      }

      // Si ya tenemos productos cargados, aplica filtro de inmediato
      this.aplicarFiltros();
    });
  }

  // ← ya la tenías: ahora solo se encarga de cargar productos
  ionViewWillEnter() {
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
  !this.rangoPrecio || (
    producto.precio >= this.rangoPrecio.lower &&
    producto.precio <= this.rangoPrecio.upper
  );


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

    // 👇 opcional: quitar la categoría del queryParam cuando limpias filtros
    this.categoriaSeleccionada = null;
    this.router.navigate(['/home']);

    this.aplicarFiltros();
  }

  formatearPrecio(precio: number): string {
    return precio === 0 ? '$0' : `$${precio.toLocaleString('es-CL')}`;
  }

  formatearRangoPrecio(valor: number): string {
    return `$${(valor / 1000).toFixed(0)}.000`;
  }
}