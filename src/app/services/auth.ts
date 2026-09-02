import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UpdateUserRequest } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Auth`;


  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        const user = response.data;
        if (response.success && user?.token) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userId', String(user.userId));
          localStorage.setItem('fullName', user.fullName);
          localStorage.setItem('email', user.email);
          localStorage.setItem('role', user.role);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  updateUser(id: number, data: UpdateUserRequest): Observable<unknown> {
    return this.http.put(`${environment.apiUrl}/Users/${id}`, data).pipe(
      tap(() => {
        const currentUser = this.getCurrentUser() ?? {};
        const updatedUser = { ...currentUser, fullName: data.fullName, phoneNumber: data.phoneNumber };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('fullName', data.fullName);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getCurrentUser(): Record<string, string> | null {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) as Record<string, string> : null;
  }

  logout(): void {
    ['token', 'user', 'userId', 'fullName', 'email', 'role'].forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
