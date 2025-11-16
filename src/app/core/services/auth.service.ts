import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { AuthResponse, AuthResponseFromBackend, LoginRequest, RegisterRequest, UserResponseFromBackend } from '../models/auth.model';

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
    const backendRequest = {
      Email: credentials.mail,
      Password: credentials.pwd
    };

    console.log('Enviando requisição de login:', backendRequest);

    return this.http.post<AuthResponseFromBackend>(`${environment.apiUrl}/Users/authenticate`, backendRequest)
      .pipe(
        map(response => {
          console.log('Resposta do login:', response);

          const authResponse: AuthResponse = {
            authenticated: 1,
            userId: 0,
            name: credentials.mail,  // Usamos o email como nome temporariamente
            token: response.accessToken
          };

          this.setToken(response.accessToken);

          const user: User = {
            userId: 0,
            name: credentials.mail,
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

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 100);

          return authResponse;
        }),
        catchError(error => {
          console.error('Erro na requisição de login:', error);

          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<User> {
    const backendRequest = {
      email: userData.mail,
      password: userData.pwd
    };

    return this.http.post<UserResponseFromBackend>(`${environment.apiUrl}/Users`, backendRequest)
      .pipe(
        map(response => {
          const user: User = {
            userId: response.id,
            name: userData.name,
            mail: response.email,
            accountId: userData.accountId || 0,
            master: 0,
            active: response.isActive ? 1 : 0,
            createDate: new Date(response.createdAt),
            changeDate: new Date()
          };

          return user;
        }),
        tap(user => {
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