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
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  personOutline,
  callOutline,
  mailOutline,
  person,
} from 'ionicons/icons';

interface InformacionAdicional {
  label: string;
  valor: string;
}

interface Producto {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  imagen: string;
  uso: string;
  campus: string;
  precioConversable: boolean;
  vendedor: string;
  telefono: string;
  email: string;
  informacionAdicional: InformacionAdicional[];
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
  ],
})
export class DetalleProductoPage implements OnInit {
  producto: Producto = {
    id: 1,
    titulo: 'Calculadora Científica usada',
    precio: 10000,
    descripcion: 'Calculadora científica en excelente estado, utilizada solo durante un año universitario. Funciona perfectamente, sin rayas en la pantalla y con todas las teclas operativas. Ideal para estudiantes de enseñanza media o universitaria.',
    imagen: 'assets/calc.jpg', // Imagen actualizada
    uso: '1 Año',
    campus: 'Casa Central',
    precioConversable: true,
    vendedor: 'Sebastián Castro',
    telefono: '+56 9 1234 5678',
    email: 'example@mail.pucv.cl',
    informacionAdicional: [
      { label: 'Marca', valor: 'Casio' },
      { label: 'Modelo', valor: 'fx-570ES Plus' },
      { label: 'Pantalla', valor: '2 líneas con display natural' },
      { label: 'Funciones', valor: 'más de 400 operaciones científicas' },
      { label: 'Energía', valor: 'solar + batería' },
      { label: 'Estado', valor: 'usado, en perfecto funcionamiento' },
      { label: 'Incluye', valor: 'tapa protectora' },
    ],
  };

  resenas: Resena[] = [
    { usuario: 'Usuario1', comentario: 'Excelente atención. 100% recomendable.' },
    { usuario: 'Usuario2', comentario: 'Excelente atención. 100% recomendable.' },
  ];

  productosRelacionados: ProductoRelacionado[] = [
    {
      id: 2,
      titulo: 'Libro de Matemáticas',
      precio: 5000,
      imagen: 'assets/libro.jpg', // Imagen actualizada
      descripcionCorta: 'Matemáticas universitarias introductorias',
    },
    {
      id: 3,
      titulo: 'Kit de útiles escolares',
      precio: 3000,
      imagen: 'assets/kit.jpg', // Imagen actualizada
      descripcionCorta: 'Set completo para universidad',
    },
  ];

  constructor(private route: ActivatedRoute) {
    addIcons({
      cartOutline,
      personOutline,
      callOutline,
      mailOutline,
      person,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(Number(id));
    }
  }

  cargarProducto(id: number) {
    // Aquí conectarías con tu servicio para obtener el producto desde el backend
    console.log('Cargando producto:', id);
  }

  formatearPrecio(precio: number): string {
    return precio === 0 ? '$0' : `$${precio.toLocaleString('es-CL')}`;
  }
}
