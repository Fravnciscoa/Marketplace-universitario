import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Producto {
  ano_compra: string;
  condicion: string;
  modelo: string;
  marca: string;
vendedor: any;
  id?: number;
  titulo: string;
  precio: number;
  imagen: string;
  descripcion: string;
  categoria: string;
  campus: string;
  user_id?: number;
  created_at?: Date;
  vendedor_nombre?: string;  // ← NUEVO
  updated_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = 'http://localhost:3000/api/productos';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
// ✅ NUEVO: Obtener productos de un usuario
  getProductosByUser(userId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/user/${userId}`);
  }

 getProductos(): Observable<Producto[]> {
  return this.http.get<Producto[]>(this.apiUrl);
}



  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto, {
      headers: this.getHeaders()
    });
  }

  updateProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto, {
      headers: this.getHeaders()
    });
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
