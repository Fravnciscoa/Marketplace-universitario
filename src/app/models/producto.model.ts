export interface Producto {
  id: string;
  titulo: string;
  precio: number;
  estado: 'venta' | 'intercambio' | 'prestamo';
}
