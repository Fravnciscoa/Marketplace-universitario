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
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  cartOutline,
  logInOutline,
  logOutOutline,
  personOutline,
  trashOutline,
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { Producto } from '../../services/productos.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonList,
    CommonModule,
    RouterLink,
  ],
})
export class CarritoPage implements OnInit {
  isLoggedIn = false;

  carrito: Producto[] = [];
  total = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      cartOutline,
      logInOutline,
      logOutOutline,
      personOutline,
      trashOutline,
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });

    this.cargarCarrito();
  }

  cargarCarrito() {
    // 🔥 Temporal: productos de ejemplo en el carrito
this.carrito = [
  {
    id: 1,
    titulo: 'Cálculo I - Stewart',
    descripcion: 'Libro universitario clásico',
    precio: 15000,
    categoria: 'libros',
    campus: 'Casa Central',
    imagen: 'assets/demo/libro.jpg',

    // 🔥 CAMPOS EXTRA QUE EXIGE EL MODELO
    ano_compra: "2023",
    condicion: 'Usado',
    modelo: '7ma edición',
    marca: 'Stewart',
    vendedor: 'UsuarioDemo1',
  },
  {
    id: 5,
    titulo: 'Audífonos Bluetooth',
    descripcion: 'Cancelación de ruido',
    precio: 18000,
    categoria: 'electronica',
    campus: 'Curauma',
    imagen: 'assets/demo/audifonos.jpg',

    // 🔥 CAMPOS EXTRA QUE EXIGE EL MODELO
    ano_compra: "2024",
    condicion: 'Como nuevo',
    modelo: 'AirSound X1',
    marca: 'SoundTech',
    vendedor: 'UsuarioDemo2',
  },
];


    this.calcularTotal();
  }

  calcularTotal() {
    this.total = this.carrito.reduce((acc, p) => acc + (p.precio || 0), 0);
  }

  // 👇 acepta number | undefined, así no se enoja TS
  eliminarProducto(id?: number) {
    if (id == null) return;
    this.carrito = this.carrito.filter((p) => p.id !== id);
    this.calcularTotal();
  }

  vaciarCarrito() {
    this.carrito = [];
    this.total = 0;
  }

  // 👇 mismo patrón que en Home
  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  formatearPrecio(valor: number): string {
    return `$${valor.toLocaleString('es-CL')}`;
  }
}
