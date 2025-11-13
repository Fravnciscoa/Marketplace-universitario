export interface Producto {
  id: number;
  titulo: string;
  precio: number;
  imagen: string;
  descripcion: string;
  categoria: string;
  campus: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}
