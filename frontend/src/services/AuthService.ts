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
        credentials: 'include', 
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer login');
      }

      const authResponse = await response.json();
      console.log("[login] authResponse: ", authResponse);

      this.saveUserInfo(authResponse.user);

      if (authResponse.token) {
        this.saveToken(authResponse.token);
      }

      return authResponse;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao cadastrar usuário');
      }

      const authResponse = await response.json();
      
      this.saveUserInfo(authResponse.user);
      
      if (authResponse.token) {
        this.saveToken(authResponse.token);
      }
      
      return authResponse;
    } catch (error) {
      throw error;
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/check`, {
        method: 'GET',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          this.saveUserInfo(data.user);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.removeToken();
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
    delete (window as any).__user_info;
  }

  isAuthenticated(): boolean {
    const hasLocalToken = !!this.getToken();
    const hasUserInfo = !!this.getUserInfo();
    return hasLocalToken || hasUserInfo;
  }

  saveUserInfo(user: any): void {
    (window as any).__user_info = user;
  }

  getUserInfo(): any {
    return (window as any).__user_info || null;
  }

  getUserNickname(): string | null {
    const userInfo = this.getUserInfo();
    return userInfo?.displayName || userInfo?.name || null;
  }
}