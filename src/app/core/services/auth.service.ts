import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthUser, ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly AUTH_KEY = 'demo_auth_user';
  private apiUrl = `${environment.apiUrl}/auth`;

  // Backend OAuth2 entry point
  private googleAuthUrl = 'http://localhost:8082/oauth2/authorization/google';

  private _currentUser = signal<AuthUser | null>(this.getInitialUser());

  currentUser = computed(() => this._currentUser());
  isLoggedIn = computed(() => !!this._currentUser()?.authenticated);

  private getInitialUser(): AuthUser | null {
    if (this.isBrowser) {
      try {
        const stored = localStorage.getItem(this.AUTH_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to parse stored auth user', e);
      }
    }
    return null;
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthUser>> {
    return this.http.post<ApiResponse<AuthUser>>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._currentUser.set(response.data);
          if (this.isBrowser) {
            localStorage.setItem(this.AUTH_KEY, JSON.stringify(response.data));
          }
        }
      })
    );
  }

  loginWithGoogle(): void {
    if (this.isBrowser) {
      window.location.href = this.googleAuthUrl;
    }
  }

  handleOAuthSuccess(token: string, username?: string, email?: string): void {
    const safeUsername = username ? decodeURIComponent(username) : 'GoogleUser';
    const safeEmail = email ? decodeURIComponent(email) : '';

    const user: AuthUser = {
      username: safeUsername,
      roles: ['ROLE_USER'],
      token: token,
      authenticated: true
    };

    this._currentUser.set(user);
    if (this.isBrowser) {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
    }
  }

  getToken(): string | null {
    return this.currentUser()?.token || null;
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: () => this.finalizeLogout(),
      error: () => this.finalizeLogout()
    });
  }

  private finalizeLogout(): void {
    this._currentUser.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(this.AUTH_KEY);
    }
    this.router.navigate(['/login']);
  }
}
