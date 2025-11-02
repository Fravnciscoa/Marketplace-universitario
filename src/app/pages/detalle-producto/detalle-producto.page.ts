import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';

// Interfaces para tipado
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  usage: string;
  brand: string;
  model: string;
  screen: string;
  functions: string;
  power: string;
  condition: string;
  includes: string;
  rating: number;
  images: string[];
}

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  image: string;
}

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  imports: [IonicModule],
})
export class DetalleProductoPage implements OnInit {
  // Propiedad product definida con imágenes locales
  product: Product = {
    id: 1,
    name: 'Calculadora Científica usada',
    price: 10000,
    description:
      'Calculadora científica en excelente estado, utilizada solo durante un año universitario. Funciona perfectamente, sin rayas en la pantalla y con todas las teclas operativas. Ideal para estudiantes de enseñanza media o universitaria.',
    usage: '1 Año',
    brand: 'Casio',
    model: 'fx-570ES Plus',
    screen: '2 líneas con display natural',
    functions: 'más de 400 operaciones científicas',
    power: 'solar + batería',
    condition: 'usado, en perfecto funcionamiento',
    includes: 'tapa protectora',
    rating: 4.5,
    images: [
      'assets/images/calculadora-cientifica.jpg',
      'assets/images/calculadora-1.jpg',
      'assets/images/calculadora-2.jpg',
      'assets/images/calculadora-3.jpg',
    ],
  };

  // Propiedad relatedProducts definida con imágenes locales
  relatedProducts: RelatedProduct[] = [
    {
      id: 2,
      name: 'Libro Cálculo I',
      price: 5000,
      description: 'Libro de cálculo diferencial e integral, edición 2023.',
      category: 'MATEMÁTICAS',
      condition: 'SIN ESTRENAR',
      image: 'assets/images/libro-matematicas.png',
    },
    {
      id: 3,
      name: 'Cuaderno Universitario',
      price: 3500,
      description: 'Cuaderno 100 hojas cuadriculado, marca Oxford.',
      category: 'PAPELERÍA',
      condition: 'Nuevo',
      image: 'assets/images/cuaderno-universitario.png',
    },
    {
      id: 4,
      name: 'Mochila Estudiantil',
      price: 15000,
      description: 'Mochila impermeable con compartimento para laptop.',
      category: 'ACCESORIOS',
      condition: 'Usado',
      image: 'assets/images/mochila-estudiante.png',
    },
  ];

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    // Inicialización si es necesaria
  }

  // Método formatPrice definido
  formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CL')}`;
  }

  // Función para obtener el icono de estrella según el rating
  getStarIcon(starIndex: number, rating: number): string {
    if (starIndex <= Math.floor(rating)) {
      return 'star';
    } else if (starIndex === Math.ceil(rating) && !Number.isInteger(rating)) {
      return 'star-half';
    } else {
      return 'star-outline';
    }
  }

  // Función para añadir al carrito
  async addToCart() {
    const toast = await this.toastController.create({
      message: 'Producto añadido al carrito',
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  // Función para comprar ahora
  async buyNow() {
    const alert = await this.alertController.create({
      header: 'Confirmar compra',
      message: '¿Estás seguro de que quieres comprar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Comprar',
          handler: () => {
            this.showPurchaseSuccess();
          },
        },
      ],
    });
    await alert.present();
  }

  private async showPurchaseSuccess() {
    const toast = await this.toastController.create({
      message: '¡Compra realizada con éxito!',
      duration: 3000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  // Función para productos relacionados - Añadir al carrito
  async addRelatedToCart(product: RelatedProduct) {
    const toast = await this.toastController.create({
      message: `${product.name} añadido al carrito`,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  // Función para productos relacionados - Ver detalles
  async viewRelatedProduct(product: RelatedProduct) {
    const alert = await this.alertController.create({
      header: product.name,
      message:
        'Esta funcionalidad te llevaría a la página de detalles del producto.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Función para cambiar imagen principal
  changeMainImage(newImage: string, event: any) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector(
      '.main-product-image',
    ) as HTMLImageElement;

    // Remover clase active de todas las miniaturas
    thumbnails.forEach((thumb) => thumb.classList.remove('active'));

    // Agregar clase active a la miniatura clickeada
    event.target.classList.add('active');

    // Cambiar la imagen principal
    if (mainImage) {
      mainImage.src = newImage;
    }

    this.showToast('Vista cambiada');
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1000,
      position: 'bottom',
    });
    await toast.present();
  }
}