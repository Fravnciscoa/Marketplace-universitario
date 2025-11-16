import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonTitle,
  IonSpinner,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  personOutline,
  callOutline,
  mailOutline,
  person,
  addOutline,
} from 'ionicons/icons';

import { ProductosService, Producto } from '../../services/productos.service';
import { CarritoService } from '../../services/carrito.service';
import { ToastController } from '@ionic/angular';

interface Resena {
  usuario: string;
  comentario: string;
}

interface ProductoRelacionado {
  id: number;
  titulo: string;
  precio: number;
  imagen: string;
  descripcionCorta: string;
}

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardTitle,
    CommonModule,
    FormsModule,
    RouterLink,
    IonTitle,
    IonSpinner,
    IonButtons,
    IonBackButton,
  ],
})
export class DetalleProductoPage implements OnInit {
  producto: Producto | null = null;

  resenas: Resena[] = [
    {
      usuario: 'Usuario1',
      comentario: 'Excelente atención, 100% recomendable.',
    },
    {
      usuario: 'Usuario2',
      comentario: 'Excelente atención, 100% recomendable.',
    },
  ];

  productosRelacionados: ProductoRelacionado[] = [];

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductosService,
    private carritoService: CarritoService,      
    private toastController: ToastController     
  ) {
    addIcons({
      cartOutline,
      personOutline,
      callOutline,
      mailOutline,
      person,
      addOutline,
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.producto = null; 
        this.cargarProducto(Number(id));
        this.cargarProductosRelacionados();
      }
    });
  }

  cargarProducto(id: number) {
    console.log('🔥 Cargando producto con ID:', id);
    this.productosService.getProductoById(id).subscribe({
      next: (response: any) => {
        console.log('✅ Producto recibido:', response);
        this.producto = response.data || response;
        console.log('✅ Producto cargado:', this.producto);
      },
      error: (err) => {
        console.error('❌ Error al cargar producto:', err);
      },
    });
  }

  cargarProductosRelacionados() {
    // Lógica para cargar productos que no sean el actual
    this.productosRelacionados = [
    ];
  }

  formatearPrecio(precio: number): string {
    if (precio === null || precio === undefined) return '';
    return precio === 0 ? '$0' : `$${precio.toLocaleString('es-CL')}`;
  }

  
  async agregarAlCarrito() {
    if (!this.producto) return;

    this.carritoService.addItem(this.producto, 1);

    const toast = await this.toastController.create({
      message: 'Producto añadido al carrito',
      duration: 1500,
      position: 'bottom',
      color: 'success',
    });

    await toast.present();
  }
}
