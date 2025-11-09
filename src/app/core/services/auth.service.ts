import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    credentials.name = credentials.mail;
    return this.http.post<AuthResponse>(`${environment.apiUrl}/user/authenticate`, credentials)
      .pipe(
        tap(response => {
          console.log('Resposta do login:', response);
          if (response.authenticated === 1) {
            this.setToken(response.token);

            const user: User = {
              userId: response.userId,
              name: response.name,
              mail: credentials.mail,
              accountId: 0,
              master: 0,
              active: 1,
              createDate: new Date(),
              changeDate: new Date()
            };

            this.setUser(user);
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);

            console.log('Redirecionando para dashboard...');
            // Usar setTimeout para evitar loops de navegação
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 100);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/user/register`, userData)
      .pipe(
        tap(response => {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 100);
        })
      );
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  private getStoredUser(): User | null {
    const userStr = sessionStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setUser(user: User): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearStorage(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}