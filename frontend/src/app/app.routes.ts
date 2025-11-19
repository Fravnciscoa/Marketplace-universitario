//--app.routes.ts--//
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'admin-portal',
    loadComponent: () => import('./pages/admin-portal/admin-portal.page').then( m => m.AdminPortalPage),
    canActivate: [authGuard]
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
  path: 'perfil/:id',
  loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage)
},
  {
    path: 'categorias',
    loadComponent: () => import('./pages/categorias/categorias.page').then(m => m.CategoriasPage)
  },
  {
    path: 'detalle-producto/:id',
    loadComponent: () => import('./pages/detalle-producto/detalle-producto.page').then(m => m.DetalleProductoPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
    canActivate: [authGuard]
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito.page').then(m => m.CarritoPage)
  },
  {
    path: 'publicar-producto',
    loadComponent: () => import('./pages/publicar-producto/publicar-producto.page').then(m => m.PublicarProductoPage),
    canActivate: [authGuard] // Proteger con autenticación
  },
  {
    path: 'publicar',
    loadComponent: () => import('./pages/publicar-producto/publicar-producto.page').then(m => m.PublicarProductoPage),
    canActivate: [authGuard] // Proteger con autenticación
  },
  {
    path: 'editar-producto/:id',
    loadComponent: () => import('./pages/publicar-producto/publicar-producto.page').then(m => m.PublicarProductoPage),
    canActivate: [authGuard] // Proteger con autenticación
  },
  {
    path: '**',
    redirectTo: 'home'
  },
  {
    path: 'mis-productos',
    loadComponent: () => import('./pages/mis-productos/mis-productos.page').then( m => m.MisProductosPage)
  },


];
