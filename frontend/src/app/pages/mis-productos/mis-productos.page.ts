import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  cubeOutline,
  addOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import { ProductosService} from '../../services/productos.service';
import { Producto } from 'src/app/models/producto.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-productos',
  templateUrl: './mis-productos.page.html',
  styleUrls: ['./mis-productos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonToast
  ]
})
export class MisProductosPage implements OnInit {
  misProductos: Producto[] = [];
  showToast = false;
  toastMessage = '';

  constructor(
    private productosService: ProductosService,
    private authService: AuthService
  ) {
    addIcons({
      arrowBack,
      cubeOutline,
      addOutline,
      createOutline,
      trashOutline
    });
  }

  ngOnInit() {
    this.cargarMisProductos();
  }

  cargarMisProductos() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.productosService.getProductosByUser(user.id).subscribe({
          next: (productos) => {
            this.misProductos = productos;
          },
          error: (err) => {
            console.error('Error al cargar productos:', err);
            this.mostrarToast('Error al cargar tus productos');
          }
        });
      }
    });
  }

  eliminarProducto(id?: number) {
    if (!id) return;

    const confirmar = confirm('¿Estás seguro de eliminar este producto?');
    if (confirmar) {
      this.productosService.deleteProducto(id).subscribe({
        next: () => {
          this.mostrarToast('Producto eliminado exitosamente');
          this.cargarMisProductos(); // Recargar lista
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.mostrarToast('Error al eliminar el producto');
        }
      });
    }
  }

  mostrarToast(mensaje: string) {
    this.toastMessage = mensaje;
    this.showToast = true;
  }
}
