import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Producto {
  id?: number;
  titulo: string;
  precio: number;
  imagen: string;
  descripcion: string;
  categoria: string;
  campus: string;
  user_id?: number;
  vendedor_nombre?: string; // Nuevo campo del JOIN
  created_at?: Date;
  updated_at?: Date;
}

// Nueva interface para la respuesta paginada
export interface ProductosResponse {
  success: boolean;
  data: Producto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
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

  // GET con paginación y filtros (ACTUALIZADO)
  getProductos(page: number = 1, limit: number = 10, filtros?: any): Observable<ProductosResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Agregar filtros opcionales
    if (filtros?.categoria) {
      params = params.set('categoria', filtros.categoria);
    }

    if (filtros?.campus) {
      params = params.set('campus', filtros.campus);
    }

    if (filtros?.precioMin) {
      params = params.set('precioMin', filtros.precioMin.toString());
    }

    if (filtros?.precioMax) {
      params = params.set('precioMax', filtros.precioMax.toString());
    }

    return this.http.get<ProductosResponse>(this.apiUrl, { params });
  }

  // GET producto por ID (SIN CAMBIOS)
  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // POST crear producto (SIN CAMBIOS - mantiene tu autenticación)
  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto, {
      headers: this.getHeaders()
    });
  }

  // PUT actualizar producto (SIN CAMBIOS - mantiene tu autenticación)
  updateProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto, {
      headers: this.getHeaders()
    });
  }

  // DELETE eliminar producto (SIN CAMBIOS - mantiene tu autenticación)
  deleteProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
