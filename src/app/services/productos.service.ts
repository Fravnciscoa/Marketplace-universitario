import { Injectable } from '@angular/core';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly data: Producto[] = [
    { id: 'p1', titulo: 'Calculadora científica', precio: 12000, estado: 'venta' },
    { id: 'p2', titulo: 'Libro Cálculo I', precio: 8000, estado: 'intercambio' },
    { id: 'p3', titulo: 'Mochila universitaria', precio: 0, estado: 'prestamo' },
    { id: 'p4', titulo: 'Auriculares', precio: 15000, estado: 'venta' },
  ];

  list(): Producto[] {
    return this.data;
  }
}
