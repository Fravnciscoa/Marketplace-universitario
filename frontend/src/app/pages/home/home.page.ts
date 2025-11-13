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
  IonList, 
  IonButtons,
  IonSpinner, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  filterOutline,
  cartOutline,
  heartOutline,
  chevronDownOutline,
  closeOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { ProductosService, Producto } from '../../services/productos.service';

interface FiltroRango {
  lower: number;
  upper: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonText, 
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
    IonSpinner,
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

  // NUEVAS VARIABLES PARA PAGINACIÓN
  paginaActual: number = 1;
  productosPorPagina: number = 10;
  totalProductos: number = 0;
  totalPaginas: number = 0;
  tieneSiguientePagina: boolean = false;
  tienePaginaAnterior: boolean = false;
  cargando: boolean = false;

  constructor(private productosService: ProductosService) {
    addIcons({
      searchOutline,
      filterOutline,
      cartOutline,
      heartOutline,
      chevronDownOutline,
      closeOutline,
      chevronBackOutline,
      chevronForwardOutline,
    });
  }

  ngOnInit() {
    this.cargarProductos();
  }

  // MÉTODO ACTUALIZADO CON PAGINACIÓN
  cargarProductos(pagina: number = 1) {
    console.log('🔥 Cargando productos desde el backend... Página:', pagina);
    this.cargando = true;
    this.paginaActual = pagina;

    // Construir filtros para el backend
    const filtros: any = {};
    
    // Solo enviar filtros de categoría si alguno está seleccionado
    const categoriaSeleccionada = Object.keys(this.categoriaFiltros).find(
      key => this.categoriaFiltros[key as keyof typeof this.categoriaFiltros]
    );
    if (categoriaSeleccionada) {
      filtros.categoria = categoriaSeleccionada;
    }

    // Solo enviar filtros de campus si alguno está seleccionado
    const campusSeleccionado = Object.keys(this.campusFiltros).find(
      key => this.campusFiltros[key as keyof typeof this.campusFiltros]
    );
    if (campusSeleccionado) {
      filtros.campus = campusSeleccionado;
    }

    // Filtros de precio (siempre enviar)
    filtros.precioMin = this.rangoPrecio.lower;
    filtros.precioMax = this.rangoPrecio.upper;

    this.productosService.getProductos(pagina, this.productosPorPagina, filtros).subscribe({
      next: (response) => {
        console.log('✅ Productos recibidos:', response);
        
        // Manejar la nueva estructura de respuesta
        this.productos = response.data || [];
        
        // Actualizar metadata de paginación
        if (response.pagination) {
          this.paginaActual = response.pagination.page;
          this.totalProductos = response.pagination.total;
          this.totalPaginas = response.pagination.totalPages;
          this.tieneSiguientePagina = response.pagination.hasNextPage;
          this.tienePaginaAnterior = response.pagination.hasPrevPage;
        }

        // Aplicar filtros locales (búsqueda por texto)
        this.aplicarFiltros();
        
        console.log('✅ Productos filtrados:', this.productosFiltrados.length);
        console.log(`📄 Página ${this.paginaActual} de ${this.totalPaginas}`);
        
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        this.cargando = false;
      }
    });
  }

  // NUEVOS MÉTODOS PARA PAGINACIÓN
  siguientePagina() {
    if (this.tieneSiguientePagina && !this.cargando) {
      this.cargarProductos(this.paginaActual + 1);
    }
  }

  paginaAnterior() {
    if (this.tienePaginaAnterior && this.paginaActual > 1 && !this.cargando) {
      this.cargarProductos(this.paginaActual - 1);
    }
  }

  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas && !this.cargando) {
      this.cargarProductos(pagina);
    }
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  // FILTROS LOCALES (solo búsqueda por texto ahora)
  aplicarFiltros() {
    if (!this.terminoBusqueda) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    const textoBusqueda = this.terminoBusqueda.toLowerCase();
    this.productosFiltrados = this.productos.filter(producto => {
      return producto.titulo?.toLowerCase().includes(textoBusqueda) ||
             producto.descripcion?.toLowerCase().includes(textoBusqueda);
    });
  }

  onBusquedaChange(event: any) {
    this.terminoBusqueda = event.detail.value || '';
    this.aplicarFiltros();
  }

  onRangoPrecioChange(event: any) {
    this.rangoPrecio = event.detail.value;
    // Recargar productos con nuevo rango de precio
    this.cargarProductos(1); // Volver a página 1
  }

  onFiltroChange() {
    // Recargar productos cuando cambian filtros de categoría/campus
    this.cargarProductos(1); // Volver a página 1
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

    this.terminoBusqueda = '';
    
    // Recargar productos sin filtros
    this.cargarProductos(1);
  }

  formatearPrecio(precio: number): string {
    return precio === 0 ? '$0' : `$${precio.toLocaleString('es-CL')}`;
  }

  formatearRangoPrecio(valor: number): string {
    return `$${(valor / 1000).toFixed(0)}.000`;
  }
}
