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
      
      // Não salvamos o token localmente, pois ele está no cookie httpOnly
      // if (authResponse.token) {
      //   this.saveToken(authResponse.token);
      // }
      
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
      
      this.clearUserInfo();
      return false;
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      this.clearUserInfo();
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Resposta não OK do servidor no logout:', response.status);
      }

      const data = await response.json();
      console.log('Logout response:', data);
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.clearUserInfo();
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir conta');
      }

      const data = await response.json();
      console.log('Delete account response:', data);
      
      this.clearUserInfo();
      
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      throw error; 
    }
  }

  saveToken(token: string): void {
    //O token está seguro no cookie httpOnly
    console.log('Token será gerenciado via cookie httpOnly');
  }

  getToken(): string | null {
    //Não podemos acessar cookies httpOnly do JavaScript
    //A autenticação é verificada via checkAuthStatus()
    return null;
  }

  removeToken(): void {
    this.clearUserInfo();
  }

  isAuthenticated(): boolean {
    return !!this.getUserInfo();
  }

  saveUserInfo(user: any): void {
    try {
      localStorage.setItem('user_info', JSON.stringify(user));
      (window as any).__user_info = user;
    } catch (error) {
      console.warn('Erro ao salvar no localStorage, usando apenas memória:', error);
      (window as any).__user_info = user;
    }
  }

  getUserInfo(): any {
    try {
      let userInfo = (window as any).__user_info;
      
      if (!userInfo) {
        const stored = localStorage.getItem('user_info');
        if (stored) {
          userInfo = JSON.parse(stored);
          (window as any).__user_info = userInfo; // Sincroniza com a memória
        }
      }
      
      return userInfo || null;
    } catch (error) {
      console.warn('Erro ao recuperar informações do usuário:', error);
      return (window as any).__user_info || null;
    }
  }

  getUserNickname(): string | null {
    const userInfo = this.getUserInfo();
    return userInfo?.displayName || userInfo?.name || null;
  }


  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao solicitar redefinição de senha');
      }

      //Sempre retorna sucesso por questões de segurança
      return;
    } catch (error) {
      throw error;
    }
  }

  async validateResetToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-reset-token/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao redefinir senha');
      }

      return;
    } catch (error) {
      throw error;
    }
  }

  private clearUserInfo(): void {
    try {
      localStorage.removeItem('user_info');
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
    delete (window as any).__user_info;
  }
}