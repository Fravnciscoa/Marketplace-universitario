import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  homeOutline,
  logOutOutline,
  peopleOutline,
  cubeOutline,
  statsChartOutline,
  settingsOutline
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { AdminProductosService } from '../../services/admin-productos.services';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-admin-portal',
  templateUrl: './admin-portal.page.html',
  styleUrls: ['./admin-portal.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class AdminPortalPage implements OnInit {

  adminUser: User | null = null;

  productos: Producto[] = [];
  page = 1;
  limit = 10;
  totalPages = 1;

  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private adminProductosService: AdminProductosService
  ) {
    addIcons({
      homeOutline,
      logOutOutline,
      peopleOutline,
      cubeOutline,
      statsChartOutline,
      settingsOutline
    });
  }

  ngOnInit() {
    this.adminUser = this.authService.getCurrentUser();
    this.cargarProductos();
  }

  // 🔹 Cargar productos para el panel admin
  cargarProductos() {
    this.cargando = true;
    this.adminProductosService.getProductosAdmin(this.page, this.limit).subscribe({
      next: (productos) => {
        this.productos = productos;
        // OJO: si quieres usar paginación real con totalPages,
        // cambia el service para que devuelva también la metadata.
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando productos admin', err);
        this.cargando = false;
      }
    });
  }

  irAHome() {
    this.router.navigate(['/home']);
  }

  irAGestionProductos() {
    // Podrías hacer otra página tipo /admin/productos, por ahora esta misma es gestión
    this.router.navigate(['/admin-portal']);
  }

  irAGestionUsuarios() {
    console.log('Ir a gestión de usuarios (por implementar)');
  }

  irAReportes() {
    console.log('Ir a reportes (por implementar)');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  // 🔹 Ir a página de edición (cuando la tengas)
  irAEditarProducto(id: number) {
    this.router.navigate(['/editar-producto', id]); // ajusta ruta si usas otra
  }

  // 🔹 Eliminar producto
  eliminarProducto(id: number) {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

    this.adminProductosService.deleteProductoAdmin(id).subscribe({
      next: () => {
        this.cargarProductos();
      },
      error: (err) => console.error('Error al eliminar producto', err)
    });
  }
}
