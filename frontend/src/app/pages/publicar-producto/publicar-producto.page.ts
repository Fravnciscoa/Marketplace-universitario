import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';

import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
import { 
  camera, 
  saveOutline,
  cartOutline,
  personOutline,
  logOutOutline,
  logInOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-publicar-producto',
  templateUrl: './publicar-producto.page.html',
  styleUrls: ['./publicar-producto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
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
  ]
})
export class PublicarProductoPage implements OnInit {
  // Estado de autenticación
  isLoggedIn = false;

  // Listas para selects
  categorias = [
    'Libros',
    'Electrónica',
    'Deportes'
  ];

  campusList = [
    'Isabel Brown Caces',
    'Casa Central',
    'Curauma'
  ];

  // Formulario
  form: any = {
    titulo: '',
    precio: 0,
    descripcion: '',
    categoria: '',
    campus: '',
    marca: '',
    modelo: '',
    condicion: '',
    ano_compra: '',
    imagen: ''
  };

  // Estado
  modoEdicion = false;
  productoId: number | null = null;
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  showToast = false;
  toastMessage = '';

  constructor(
    private productosService: ProductosService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    addIcons({ 
      camera, 
      saveOutline,
      cartOutline,
      personOutline,
      logOutOutline,
      logInOutline
    });
  }

  ngOnInit() {
    // Verificar autenticación
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });

    // Verificar si estamos en modo edición
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.modoEdicion = true;
        this.productoId = +params['id'];
        this.cargarProducto(this.productoId);
      }
    });
  }

  cargarProducto(id: number) {
    this.productosService.getProductos().subscribe({
      next: (productos) => {
        const producto = productos.find((p) => p.id === id);
        if (producto) {
          this.form = { ...producto };
          this.imagenPreview = producto.imagen;
        }
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.mostrarToast('Error al cargar el producto');
      }
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
        this.form.imagen = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.imagenSeleccionada = file;
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagenPreview = e.target.result;
    };
    reader.readAsDataURL(file);
    }
  }

  


  guardar() {
    // Validaciones básicas
    if (!this.form.titulo || !this.form.precio || !this.form.categoria || !this.form.campus) {
      this.mostrarToast('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    if (!this.form.imagen) {
      this.mostrarToast('Por favor selecciona una imagen');
      return;
    }

    // Asignar user_id del usuario autenticado
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.form.user_id = user.id;

        if (this.modoEdicion && this.productoId) {
          // Actualizar producto existente
          this.productosService.updateProducto(this.productoId, this.form).subscribe({
            next: () => {
              this.mostrarToast('Producto actualizado exitosamente');
              setTimeout(() => this.router.navigate(['/home']), 1500);
            },
            error: (err) => {
              console.error('Error al actualizar:', err);
              this.mostrarToast('Error al actualizar el producto');
            }
          });
        } else {
          // Crear nuevo producto
          this.productosService.createProducto(this.form).subscribe({
            next: () => {
              this.mostrarToast('Producto publicado exitosamente');
              setTimeout(() => this.router.navigate(['/home']), 1500);
            },
            error: (err) => {
              console.error('Error al publicar:', err);
              this.mostrarToast('Error al publicar el producto');
            }
          });
        }
      } else {
        this.mostrarToast('Debes iniciar sesión para publicar');
        this.router.navigate(['/auth']);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  mostrarToast(mensaje: string) {
    this.toastMessage = mensaje;
    this.showToast = true;
  }
  
}
