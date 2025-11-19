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
  IonCardHeader,
  IonItem,
  IonLabel,
  IonList,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  cartOutline,
  logInOutline,
  logOutOutline,
  personOutline,
  cardOutline,
  trashOutline,
  arrowBackOutline,
  addOutline,
  removeOutline
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { Producto } from 'src/app/models/producto.model';
import { CarritoService } from '../../services/carrito.service';
import { CartItem } from '../../models/cart-item.model';
import { PedidosService } from '../../services/pedidos.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [
    IonCardHeader,
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
  carrito: CartItem[] = [];
  total = 0;

  constructor(
    private authService: AuthService,
    private pedidosService: PedidosService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router,
    private carritoService: CarritoService
  ) {
    addIcons({
      cartOutline,
      logInOutline,
      logOutOutline,
      personOutline,
      cardOutline,
      arrowBackOutline,
      trashOutline,
      addOutline,
      removeOutline
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });

    this.cargarCarrito();
  }

  ionViewWillEnter() {
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

  eliminarProducto(index: number) {
    const producto = this.carrito[index];
    this.carritoService.removeItem(producto.producto.id);
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

  aumentar(index: number) {
    const producto = this.carrito[index];
    this.carritoService.updateCantidad(producto.producto.id, producto.cantidad + 1);
    this.cargarCarrito();
  }

  disminuir(index: number) {
    const producto = this.carrito[index];
    if (producto.cantidad > 1) {
      this.carritoService.updateCantidad(producto.producto.id, producto.cantidad - 1);
      this.cargarCarrito();
    }
  }

  async abrirModalCheckout() {
    // Verificar si está logueado
    if (!this.authService.isLoggedIn()) {
      const toast = await this.toastController.create({
        message: 'Debes iniciar sesión para realizar una compra',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      this.router.navigate(['/auth']);
      return;
    }

    // Verificar que haya productos en el carrito
    if (this.carrito.length === 0) {
      const toast = await this.toastController.create({
        message: 'Tu carrito está vacío',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    // Mostrar modal de confirmación
    const alert = await this.alertController.create({
      header: 'Finalizar Compra',
      subHeader: `Total: $${this.total.toLocaleString('es-CL')}`,
      message: 'Selecciona el método de pago y confirma tu pedido',
      inputs: [
        {
          name: 'metodo_pago',
          type: 'radio',
          label: 'Efectivo (Pago en persona)',
          value: 'efectivo',
          checked: true
        },
        {
          name: 'metodo_pago',
          type: 'radio',
          label: 'Transferencia bancaria',
          value: 'transferencia'
        },
        {
          name: 'metodo_pago',
          type: 'radio',
          label: 'Coordinar con vendedor',
          value: 'coordinar'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Continuar',
          handler: (metodo_pago) => {
            this.solicitarDireccionEntrega(metodo_pago);
          }
        }
      ]
    });

    await alert.present();
  }

  async solicitarDireccionEntrega(metodo_pago: string) {
    const alert = await this.alertController.create({
      header: 'Dirección de Entrega',
      inputs: [
        {
          name: 'direccion',
          type: 'textarea',
          placeholder: 'Ej: Campus Casa Central, Edificio A, Oficina 101'
        },
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas adicionales (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar Pedido',
          handler: (data) => {
            this.confirmarPedido(metodo_pago, data.direccion, data.notas);
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarPedido(metodo_pago: string, direccion: string, notas: string) {
    // Preparar datos del pedido
    const items = this.carrito.map(item => ({
      producto_id: item.producto.id!,
      cantidad: item.cantidad,
      precio: item.producto.precio
    }));

    const pedido = {
      items,
      total: this.total,
      metodo_pago,
      direccion_entrega: direccion || 'Por coordinar',
      notas: notas || ''
    };

    // Mostrar loading
    const loading = await (this as any).loadingController.create({
      message: 'Procesando pedido...',
      spinner: 'crescent'
    });
    await loading.present();

    // Crear pedido en el backend
    this.pedidosService.crearPedido(pedido).subscribe({
      next: async (response) => {
        console.log('Respuesta del backend:', response);
        await loading.dismiss();

        // Validar estructura de la respuesta
        let pedidoId = response?.data?.pedido_id || response?.pedido_id || response?.id || 'N/A';
        let estado = response?.data?.estado || response?.estado || 'pendiente';

        // Mostrar mensaje de éxito
        const alert = await this.alertController.create({
          header: '¡Pedido Confirmado! 🎉',
          message: `Tu pedido #${pedidoId} ha sido creado exitosamente.\n\nTotal: $${this.total.toLocaleString('es-CL')}\nEstado: ${estado}\n\nEl vendedor se contactará contigo pronto.`,
          buttons: [
            {
              text: 'Ver Mis Pedidos',
              handler: () => {
                this.router.navigate(['/perfil']);
              }
            },
            {
              text: 'Aceptar',
              role: 'cancel'
            }
          ]
        });
        await alert.present();

        // Vaciar carrito
        this.carritoService.clear();
        this.cargarCarrito();
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Error al crear pedido:', error);

        const toast = await this.toastController.create({
          message: 'Error al procesar el pedido. Intenta nuevamente.',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}