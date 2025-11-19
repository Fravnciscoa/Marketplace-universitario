//auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Importar jwt-decode
import {User} from '../models/user.model';


interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

interface JwtPayload {
  id: number;
  correo: string;
  usuario: string;
  exp: number; // Timestamp de expiración
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(tap(response => this.saveAuth(response.token, response.user)));
  }

  login(loginData: { correo: string; contrasena: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(tap(response => this.saveAuth(response.token, response.user)));
  }

  private saveAuth(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadStoredUser(): void {
    const user = localStorage.getItem('user');
    const token = this.getToken();
    
    // Verificar que el token no esté expirado al cargar
    if (user && token && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(JSON.parse(user));
    } else if (token && this.isTokenExpired(token)) {
      // Si el token expiró, hacer logout automático
      this.logout();
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Verificar si hay token válido
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar que no esté expirado
    return !this.isTokenExpired(token);
  }
  getProfile() {
  return this.http.get(`${this.apiUrl}/profile`);
  }



  // Verificar si el token está expirado
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000; // Convertir a segundos
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return true; // Si hay error, considerar como expirado
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

// Actualizar perfil
updateProfile(data: any): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  return this.http.put(`${this.apiUrl}/profile`, data, { headers });
}

}
