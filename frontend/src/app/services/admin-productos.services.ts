import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class AdminProductosService {

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

  // ===============================
  //   LISTAR (ADMIN) con paginación
  // ===============================
  getProductosAdmin(page: number = 1, limit: number = 12): Observable<Producto[]> {
    return this.http.get<{ success: boolean; data: Producto[] }>(
      `${this.apiUrl}/admin?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(res => res.data)
    );
  }

  // ===============================
  // VER PRODUCTO (ADMIN)
  // ===============================
  getProductoAdminById(id: number): Observable<Producto> {
    return this.http.get<Producto>(
      `${this.apiUrl}/admin/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // ===============================
  // EDITAR PRODUCTO (ADMIN)
  // ===============================
  updateProductoAdmin(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(
      `${this.apiUrl}/admin/${id}`,
      producto,
      { headers: this.getHeaders() }
    );
  }

  // ===============================
  // ELIMINAR PRODUCTO (ADMIN)
  // ===============================
  deleteProductoAdmin(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/admin/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
