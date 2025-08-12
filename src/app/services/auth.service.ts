import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'manager';
}

const USE_MOCK = true;

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private currentUser = signal<User | null>(null);
  constructor(private http: HttpClient) { }
  async login(email: string, password: string): Promise<boolean> {
    if (USE_MOCK) {
      const response = await fetch('/user.mock.json');
      const users: User[] = await response.json();

      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        this.currentUser.set(user);
        return true;
      }

      return false;
    } else {
      try {
        const result = await firstValueFrom(
          this.http.post<User>('/api/auth/login', { email, password })
        );
        this.currentUser.set(result);
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    }
  }

  logout() {
    this.currentUser.set(null);

    if (!USE_MOCK) {
      this.http.post('/api/auth/logout', {}).subscribe({
        next: () => console.log('Logged out'),
        error: (err) => console.warn('Logout failed:', err),
      });
    }
  }

  getUser() {
    return this.currentUser.asReadonly();
  }

  getUserId(): string | null {
    return this.currentUser()?.id ?? null;
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
