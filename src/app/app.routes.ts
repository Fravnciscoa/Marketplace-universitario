import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then(m => m.AuthPage)
  },
  {
    path: 'detalle-producto/:id',
    loadComponent: () => import('./pages/detalle-producto/detalle-producto.page').then(m => m.DetalleProductoPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito.page').then(m => m.CarritoPage)
  },  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito.page').then( m => m.CarritoPage)
  }

];