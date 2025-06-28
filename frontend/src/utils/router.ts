import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AuthService } from '../services/AuthService';

type Page = LoginPage | RegisterPage | DashboardPage;

export class Router {
  private currentPage: Page | null = null;
  private appContainer: HTMLElement;
  private authService: AuthService;
  private isInitializing = false;

  constructor(appContainer: HTMLElement) {
    this.appContainer = appContainer;
    this.authService = AuthService.getInstance();
    this.bindEvents();
    this.init();
  }

  private async init(): Promise<void> {
    this.isInitializing = true;
    
    try {
      // Verifica o status de autenticação com o servidor
      const isAuthenticated = await this.authService.checkAuthStatus();
      
      const hash = window.location.hash.replace('#', '');
      let initialRoute = hash;
      
      // Se não há rota específica na URL, decide baseado na autenticação
      if (!initialRoute) {
        initialRoute = isAuthenticated ? 'dashboard' : 'login';
      }
      
      // Se o usuário não está autenticado mas está tentando acessar dashboard
      if (!isAuthenticated && initialRoute === 'dashboard') {
        initialRoute = 'login';
      }
      
      // Se o usuário está autenticado mas está tentando acessar login/register
      if (isAuthenticated && (initialRoute === 'login' || initialRoute === 'register')) {
        initialRoute = 'dashboard';
      }
      
      this.navigateTo(initialRoute);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      this.navigateTo('login');
    } finally {
      this.isInitializing = false;
    }
  }

  private bindEvents(): void {
    window.addEventListener('popstate', (event) => {
      if (!this.isInitializing) {
        const route = event.state?.route || 'login';
        this.navigateTo(route, false);
      }
    });

    window.addEventListener('switchToRegister', () => {
      this.navigateTo('register');
    });

    window.addEventListener('switchToLogin', () => {
      this.navigateTo('login');
    });

    window.addEventListener('navigateToDashboard', () => {
      this.navigateTo('dashboard');
    });

    window.addEventListener('logout', () => {
      this.navigateTo('login');
    });
  }

  async navigateTo(route: string, push: boolean = true): Promise<void> {
    if (!this.isInitializing) {
      if (route === 'dashboard') {
        const isAuthenticated = await this.authService.checkAuthStatus();
        if (!isAuthenticated) {
          this.navigateTo('login');
          return;
        }
      }
    }

    if (this.currentPage && 'destroy' in this.currentPage) {
      this.currentPage.destroy();
    }

    switch (route) {
      case 'login':
        this.currentPage = new LoginPage();
        break;
      case 'register':
        this.currentPage = new RegisterPage();
        break;
      case 'dashboard':
        this.currentPage = new DashboardPage();
        break;
      default:
        this.navigateTo('login');
        return;
    }

    this.appContainer.innerHTML = this.currentPage.render();
    this.currentPage.bindEvents();

    if (push) {
      window.history.pushState({ route }, '', `#${route}`);
    }
  }
}