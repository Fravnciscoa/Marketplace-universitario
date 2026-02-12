import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Reporte {
  id?: number;
  producto_id: number;
  razon: string;
  descripcion?: string;
  estado?: string;
  created_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'http://localhost:3000/api/reportes';

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

  // Crear reporte
  crearReporte(reporte: Reporte): Observable<any> {
    return this.http.post(this.apiUrl, reporte, { headers: this.getHeaders() });
  }

  // Obtener reportes (admin)
  obtenerReportes(estado?: string): Observable<any> {
    const url = estado ? `${this.apiUrl}?estado=${estado}` : this.apiUrl;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Actualizar estado de reporte (admin)
  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { estado }, { headers: this.getHeaders() });
  }
}
