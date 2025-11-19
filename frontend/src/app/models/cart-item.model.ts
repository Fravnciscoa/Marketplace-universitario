import { Producto } from "./producto.model";

export interface CartItem {
  producto: Producto;
  cantidad: number;
}