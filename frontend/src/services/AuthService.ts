import { LoginCredentials, RegisterData, AuthResponse, AuthError } from '../types/Auth';

export class AuthService {
  private static instance: AuthService;
  private baseUrl = '/api/auth'; 

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer login');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro inesperado');
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao cadastrar usuário');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro inesperado');
    }
  }

  saveToken(token: string): void {
    (window as any).__auth_token = token;
  }

  getToken(): string | null {
    return (window as any).__auth_token || null;
  }

  removeToken(): void {
    delete (window as any).__auth_token;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}