import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonTitle, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  personOutline,
  callOutline,
  mailOutline,
  person,
} from 'ionicons/icons';
import { ProductosService, Producto } from '../../services/productos.service';

interface InformacionAdicional {
  label: string;
  valor: string;
}

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
    IonCardHeader,
    IonCardTitle,
    CommonModule,
    FormsModule,
    RouterLink,
    IonTitle,
    IonSpinner
],
})
export class DetalleProductoPage implements OnInit {
  producto: Producto | null = null;

  resenas: Resena[] = [
    { usuario: 'Usuario1', comentario: 'Excelente atención. 100% recomendable.' },
    { usuario: 'Usuario2', comentario: 'Excelente atención. 100% recomendable.' },
  ];

  productosRelacionados: ProductoRelacionado[] = [];

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductosService
  ) {
    addIcons({
      cartOutline,
      personOutline,
      callOutline,
      mailOutline,
      person,
    });
  }
// Método para cargar productos relacionados
cargarProductosRelacionados() {
  this.productosRelacionados = [
    {
      id: 2,
      titulo: 'Libro',
      precio: 5000,
      imagen: 'assets/libro.jpg',
      descripcionCorta: 'Body text.'
    },
    {
      id: 3,
      titulo: 'Pack lápices grafito',
      precio: 3000,
      imagen: 'assets/kit.jpg',
      descripcionCorta: 'Descripción breve del pack.'
    }
  ];
}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(Number(id));
      this.cargarProductosRelacionados(); // ← AGREGAR ESTO

    }
  }

  cargarProducto(id: number) {
    console.log('🔥 Cargando producto con ID:', id);
    
    this.productosService.getProductoById(id).subscribe({
      next: (response: any) => {
        console.log('✅ Producto recibido:', response);
        
        // Extraer el producto según la estructura de tu respuesta
        this.producto = response.data || response;
        
        console.log('✅ Producto cargado:', this.producto);
      },
      error: (err) => {
        console.error('❌ Error al cargar producto:', err);
      },
    });
  }

  formatearPrecio(precio: number): string {
    return precio === 0 ? '$0' : `$${precio.toLocaleString('es-CL')}`;
  }
}
