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

      const authResponse = await response.json();
      
      // Save user info for greeting
      this.saveUserInfo(authResponse.user);
      
      return authResponse;
    } catch (error) {
      throw error;
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

      const authResponse = await response.json();
      
      // Save user info for greeting
      this.saveUserInfo(authResponse.user);
      
      return authResponse;
    } catch (error) {
      throw error;
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
    return !!this.getToken();
  }

  saveUserInfo(user: any): void {
    (window as any).__user_info = user;
  }

  getUserInfo(): any {
    return (window as any).__user_info || null;
  }

  getUserNickname(): string | null {
    const userInfo = this.getUserInfo();
    return userInfo?.nickname || userInfo?.name || null;
  }

  private extractNicknameFromEmail(email: string): string {
    // Extract the part before @ as nickname
    const atIndex = email.indexOf('@');
    if (atIndex > 0) {
      return email.substring(0, atIndex);
    }
    return email;
  }
}