import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private storageKey = 'carrito';

  private leer(): CartItem[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private guardar(items: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  getItems(): CartItem[] {
    return this.leer();
  }

  addItem(producto: Producto, cantidad: number = 1): void {
    const items = this.leer();

    const index = items.findIndex((i) => i.producto.id === producto.id);

    if (index >= 0) {
      items[index].cantidad += cantidad;
    } else {
      items.push({ producto, cantidad });
    }

    this.guardar(items);
  }

  updateCantidad(idProd: number | undefined, cantidad: number): void {
    if (idProd == null) return;

    const items = this.leer();
    const index = items.findIndex((i) => i.producto.id === idProd);

    if (index >= 0) {
      items[index].cantidad = cantidad;
      if (items[index].cantidad <= 0) {
        items.splice(index, 1);
      }
      this.guardar(items);
    }
  }

  removeItem(idProd: number | undefined): void {
    if (idProd == null) return;

    const items = this.leer().filter((i) => i.producto.id !== idProd);
    this.guardar(items);
  }

  clear(): void {
    this.guardar([]);
  }

  getTotal(): number {
    const items = this.leer();
    return items.reduce(
      (total, item) => total + (item.producto.precio || 0) * item.cantidad,
      0
    );
  }
}