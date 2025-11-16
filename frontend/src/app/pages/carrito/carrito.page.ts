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
import { CarritoService } from '../../services/carrito.service';
import { CartItem } from '../../models/cart-item.model';

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

  // Antes: Producto[] = []
  carrito: CartItem[] = [];
  total = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private carritoService: CarritoService  // 👈 nuevo
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

  ionViewWillEnter() {
    // por si entras/sales de la página, que se actualice
    this.cargarCarrito();
  }

  cargarCarrito() {
    this.carrito = this.carritoService.getItems();
    this.calcularTotal();
  }

  calcularTotal() {
    this.total = this.carrito.reduce(
      (acc, item) => acc + (item.producto.precio || 0) * item.cantidad,
      0
    );
  }

  eliminarProducto(id?: number) {
    this.carritoService.removeItem(id);
    this.cargarCarrito();
  }

  vaciarCarrito() {
    this.carritoService.clear();
    this.cargarCarrito();
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  formatearPrecio(valor: number): string {
    return `$${valor.toLocaleString('es-CL')}`;
  }

  // opcional: métodos para sumar/restar cantidad
  aumentar(item: CartItem) {
    this.carritoService.updateCantidad(item.producto.id, item.cantidad + 1);
    this.cargarCarrito();
  }

  disminuir(item: CartItem) {
    this.carritoService.updateCantidad(item.producto.id, item.cantidad - 1);
    this.cargarCarrito();
  }
}