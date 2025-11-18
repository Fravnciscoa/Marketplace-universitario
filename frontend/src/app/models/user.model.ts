export interface User {
  id: number;
  nombre: string;
  correo: string;
  usuario: string;
  rol: 'user' | 'admin';
  rut?: string;
  region?: string;
  comuna?: string;
}