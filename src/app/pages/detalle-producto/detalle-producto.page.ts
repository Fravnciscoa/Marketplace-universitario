import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonText,
  IonSpinner,
  IonBackButton,
  ToastController,
  AlertController,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  cartOutline,
  heartOutline,
  shareOutline,
  personCircleOutline,
  chatbubbleOutline,
} from 'ionicons/icons';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonText,
    IonSpinner,
    IonBackButton,
    IonItem,
    IonLabel,
  ],
})
export class DetalleProductoPage implements OnInit {
  producto: Producto | null = null;
  isLoading = true;
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      arrowBackOutline,
      cartOutline,
      heartOutline,
      shareOutline,
      personCircleOutline,
      chatbubbleOutline,
    });
  }

  ngOnInit() {
    console.log('🔥 Inicializando detalle-producto...');
    this.cargarProducto();
  }

    cargarProducto() {
      this.route.paramMap.subscribe(params => {
        const rawId = params.get('id');
        
        console.log('📦 Raw ID:', rawId);

        // Asegúrate que sea solo un número
        const productId = parseInt(rawId?.split(':')[0] || '0', 10);
        
        console.log('📦 Clean ID:', productId);

        if (!productId || isNaN(productId)) {
          console.error('❌ ID no válido');
          this.isLoading = false;
          this.mostrarError('ID de producto inválido');
          return;
        }

        // URL DIRECTA sin usar el servicio (temporal)
        const apiUrl = `http://localhost:3000/api/productos/${productId}`;
        
        this.productosService.getProductoById(productId).subscribe({
          next: (data) => {
            console.log('✅ Producto cargado:', data);
            this.producto = data;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('❌ Error:', error);
            this.isLoading = false;
            this.mostrarError('No se pudo cargar el producto');
          },
        });
      });
    }


  formatearPrecio(precio: number): string {
    return `$${precio.toLocaleString('es-CL')}`;
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    const message = this.isFavorite ? '❤️ Agregado a favoritos' : '🤍 Removido de favoritos';
    this.mostrarToast(message, 'success');
  }

  async contactarVendedor() {
    if (!this.producto) return;
    this.mostrarToast('📞 Abriendo chat con vendedor...', 'info');
  }

  async comprar() {
    if (!this.producto) return;

    const alert = await this.alertCtrl.create({
      header: '🛒 Confirmar Compra',
      message: `¿Deseas comprar "${this.producto.titulo}" por ${this.formatearPrecio(this.producto.precio)}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Comprar',
          handler: () => {
            this.mostrarToast('✅ Compra realizada exitosamente', 'success');
            setTimeout(() => this.router.navigate(['/home']), 2000);
          },
        },
      ],
    });

    await alert.present();
  }

  async compartir() {
    if (navigator.share && this.producto) {
      try {
        await navigator.share({
          title: this.producto.titulo,
          text: this.producto.descripcion,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else {
      this.mostrarToast('Función de compartir no disponible', 'warning');
    }
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    toast.present();
  }

  private async mostrarError(message: string) {
    const alert = await this.alertCtrl.create({
      header: '❌ Error',
      message,
      buttons: [
        {
          text: 'Volver',
          handler: () => this.router.navigate(['/home']),
        },
      ],
    });
    await alert.present();
  }
}
