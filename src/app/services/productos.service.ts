import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = `${environment.apiUrl}/api/productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    console.log('📡 GET:', this.apiUrl);
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getProductoById(id: number): Observable<Producto> {
    const url = `${this.apiUrl}/${id}`;
    console.log('📡 GET:', url);
    return this.http.get<Producto>(url);
  }

  createProducto(producto: Producto): Observable<Producto> {
    console.log('📡 POST:', this.apiUrl);
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  updateProducto(id: number, producto: Producto): Observable<Producto> {
    const url = `${this.apiUrl}/${id}`;
    console.log('📡 PUT:', url);
    return this.http.put<Producto>(url, producto);
  }

  deleteProducto(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    console.log('📡 DELETE:', url);
    return this.http.delete<void>(url);
  }
}
