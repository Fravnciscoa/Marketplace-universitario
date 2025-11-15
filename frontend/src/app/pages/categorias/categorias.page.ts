import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonLabel,
  IonItem,
  IonList,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  cartOutline,
  logInOutline,
  logOutOutline,
  personOutline,
  bookOutline,
  laptopOutline,
  basketballOutline,
} from 'ionicons/icons';

import { ProductosService, Producto } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';

interface CategoriaUI {
  id: 'libros' | 'electronica' | 'deportes';
  nombre: string;
  icono: string;
  descripcion: string;
}

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonLabel,
    IonItem,
    IonList,
    CommonModule,
    RouterLink,
  ],
})
export class CategoriasPage implements OnInit {
  isLoggedIn = false;

  categorias: CategoriaUI[] = [
    {
      id: 'libros',
      nombre: 'Libros',
      icono: 'book-outline',
      descripcion: 'Apuntes, guías, textos universitarios y material de estudio.',
    },
    {
      id: 'electronica',
      nombre: 'Electrónica',
      icono: 'laptop-outline',
      descripcion: 'Notebooks, tablets, audífonos y accesorios para tus clases.',
    },
    {
      id: 'deportes',
      nombre: 'Deportes',
      icono: 'basketball-outline',
      descripcion: 'Ropa deportiva, balones, mochilas y más para el campus.',
    },
  ];

  productos: Producto[] = [];
  productosPorCategoria: Record<string, Producto[]> = {};

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      cartOutline,
      logInOutline,
      logOutOutline,
      personOutline,
      bookOutline,
      laptopOutline,
      basketballOutline,
    });
  }

  ngOnInit(): void {
    // Estado de auth igual que en Home
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });

    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.armarProductosPorCategoria();
      },
      error: (err) => {
        console.error('❌ Error al cargar productos en categorías:', err);
      },
    });
  }

  private armarProductosPorCategoria(): void {
    const mapa: Record<string, Producto[]> = {};

    this.categorias.forEach((cat) => {
      mapa[cat.id] = this.productos
        .filter((p) => p.categoria === cat.id)
        .slice(0, 3); // solo 3 productos
    });

    this.productosPorCategoria = mapa;
  }

  formatearPrecio(precio: number): string {
    return precio === 0 ? '$0' : `$${precio.toLocaleString('es-CL')}`;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  verCategoriaCompleta(categoriaId: string): void {
    // Opcional: ir al home con queryParams o a una futura ruta /productos
    this.router.navigate(['/home'], { queryParams: { categoria: categoriaId } });
  }
}
