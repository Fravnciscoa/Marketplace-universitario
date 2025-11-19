import { Component, OnInit } from '@angular/core';
import { AlertController,  } from '@ionic/angular';
import { ReportesService } from '../../services/reportes.service';
import { AuthService } from '../../services/auth.service';
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
  flagOutline,
} from 'ionicons/icons';

import { Producto } from 'src/app/models/producto.model';
import { ProductosService} from '../../services/productos.service';
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
    private toastController: ToastController,
    private reportesService: ReportesService,
    private authService: AuthService,
    private alertController: AlertController     
  ) {
    addIcons({
      cartOutline,
      personOutline,
      callOutline,
      mailOutline,
      person,
      addOutline,
      flagOutline
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
async abrirModalReporte() {
  // Verificar si está logueado
  if (!this.authService.isLoggedIn()) {
    const toast = await this.toastController.create({
      message: 'Debes iniciar sesión para reportar',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  const alert = await this.alertController.create({
    header: 'Reportar publicación',
    subHeader: 'Selecciona el motivo del reporte',
    inputs: [
      {
        name: 'razon',
        type: 'radio',
        label: 'Contenido inapropiado',
        value: 'contenido_inapropiado'
      },
      {
        name: 'razon',
        type: 'radio',
        label: 'Fraude o estafa',
        value: 'fraude'
      },
      {
        name: 'razon',
        type: 'radio',
        label: 'Producto prohibido',
        value: 'producto_prohibido'
      },
      {
        name: 'razon',
        type: 'radio',
        label: 'Spam o duplicado',
        value: 'spam'
      },
      {
        name: 'razon',
        type: 'radio',
        label: 'Otro',
        value: 'otro',
        checked: true
      }
    ],
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Continuar',
        handler: (razon) => {
          this.solicitarDescripcionReporte(razon);
        }
      }
    ]
  });

  await alert.present();
}

async solicitarDescripcionReporte(razon: string) {
  const alert = await this.alertController.create({
    header: 'Descripción del reporte',
    inputs: [
      {
        name: 'descripcion',
        type: 'textarea',
        placeholder: 'Describe el problema (opcional)'
      }
    ],
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Enviar reporte',
        handler: (data) => {
          this.enviarReporte(razon, data.descripcion);
        }
      }
    ]
  });

  await alert.present();
}

async enviarReporte(razon: string, descripcion: string) {
  const reporte = {
    producto_id: this.producto!.id!,
    razon,
    descripcion
  };

  this.reportesService.crearReporte(reporte).subscribe({
    next: async (response) => {
      const toast = await this.toastController.create({
        message: 'Reporte enviado correctamente. Será revisado por un administrador.',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    },
    error: async (error) => {
      console.error('Error al enviar reporte:', error);
      const toast = await this.toastController.create({
        message: 'Error al enviar el reporte. Intenta nuevamente.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  });
}

}
