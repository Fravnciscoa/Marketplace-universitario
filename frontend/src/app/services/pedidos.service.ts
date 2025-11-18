import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Pedido {
  id?: number;
  total: number;
  estado?: string;
  metodo_pago: string;
  direccion_entrega: string;
  notas?: string;
  items: PedidoItem[];
  created_at?: Date;
}

export interface PedidoItem {
  producto_id: number;
  cantidad: number;
  precio: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = 'http://localhost:3000/api/pedidos';

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

  // Crear pedido (checkout)
  crearPedido(pedido: Pedido): Observable<any> {
    return this.http.post(this.apiUrl, pedido, { headers: this.getHeaders() });
  }

  // Obtener mis pedidos
  obtenerMisPedidos(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  // Obtener detalle de un pedido
  obtenerDetallePedido(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
