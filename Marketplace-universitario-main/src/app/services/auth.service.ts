import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Ajusta si cambia el puerto

  constructor(private http: HttpClient) {}

  // ✅ Registro
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // ✅ Login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  // ✅ Obtener perfil (ruta protegida)
  getProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/profile`, { headers });
  }

  // ✅ Logout
  logout(): void {
    localStorage.removeItem('token');
  }

  // ✅ Saber si hay sesión activa
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
