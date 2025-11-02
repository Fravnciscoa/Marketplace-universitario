import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'categorias',  // 🔥 Agrega esta ruta
    loadComponent: () => import('./pages/categorias/categorias.page').then(m => m.CategoriasPage)
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then(m => m.AuthPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage)
  },
  {
    path: 'detalle-producto/:id',
    loadComponent: () => import('./pages/detalle-producto/detalle-producto.page').then(m => m.DetalleProductoPage)
  },
  {
    path: '**',  // Ruta wildcard para URLs no encontradas
    redirectTo: 'home'
  },  {
    path: 'categorias',
    loadComponent: () => import('./pages/categorias/categorias.page').then( m => m.CategoriasPage)
  }

];
