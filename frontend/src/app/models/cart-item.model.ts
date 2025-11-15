import { Producto } from '../services/productos.service';

export interface CartItem {
  producto: Producto;
  cantidad: number;
}
