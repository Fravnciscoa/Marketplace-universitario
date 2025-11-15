import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonContent,
  IonTitle,
  IonToolbar,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonIcon,
  IonButtons,
  IonToast
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { camera, saveOutline } from 'ionicons/icons';

import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService, Producto } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-publicar-producto',
  templateUrl: './publicar-producto.page.html',
  styleUrls: ['./publicar-producto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonContent,
    IonTitle,
    IonToolbar,
    IonInput,
    IonItem,
    IonLabel,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonIcon,
    IonButtons,
    IonToast
  ],
})
export class PublicarProductoPage implements OnInit {

  // Modo edición
  modoEdicion = false;
  productoId: number | null = null;

  // Preview imagen
  imagenPreview: string | null = null;

  // Toast
  toastMsg = '';
  toastOpen = false;

  // Formulario
  form: Producto = {
    titulo: '',
    precio: 0,
    imagen: '',
    descripcion: '',
    categoria: '',
    campus: '',
    marca: '',
    modelo: '',
    condicion: '',
    ano_compra: '',
    vendedor: '',
  };

  // ✅ CORREGIR: Categorías coincidentes con filtros
  categorias = [
    'Libros',
    'Electrónica',
    'Deportes'
  ];

  // ✅ CORREGIR: Campus coincidentes con filtros
  campusList = [
    'Isabel Brown Caces',
    'Casa Central',
    'Curauma'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService,
    private authService: AuthService
  ) {
    addIcons({ camera, saveOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modoEdicion = true;
      this.productoId = Number(id);
      this.cargarProducto(Number(id));
    }
  }

  cargarProducto(id: number) {
    this.productosService.getProductoById(id).subscribe({
      next: (prod) => {
        this.form = prod;
        this.imagenPreview = prod.imagen || null;
      },
      error: () => this.mostrarToast('Error al cargar el producto')
    });
  }

  // ==========================
  // IMAGEN
  // ==========================
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.form.imagen = reader.result as string;
      this.imagenPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ==========================
  // GUARDAR
  // ==========================
  guardar() {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.mostrarToast('Debes iniciar sesión');
      this.router.navigate(['/auth']);
      return;
    }

    if (!this.form.titulo || !this.form.precio || !this.form.categoria) {
      this.mostrarToast('Completa los campos obligatorios');
      return;
    }

    this.form.vendedor = user.nombre;
    this.form.user_id = user.id;

    if (this.modoEdicion && this.productoId) {
      this.productosService.updateProducto(this.productoId, this.form).subscribe({
        next: () => {
          this.mostrarToast('Producto actualizado');
          this.router.navigate(['/home']);
        },
        error: () => this.mostrarToast('Error al actualizar')
      });

    } else {
      this.productosService.createProducto(this.form).subscribe({
        next: () => {
          this.mostrarToast('Producto publicado');
          this.router.navigate(['/home']);
        },
        error: () => this.mostrarToast('Error al publicar')
      });
    }
  }

  mostrarToast(msg: string) {
    this.toastMsg = msg;
    this.toastOpen = true;
  }
}
