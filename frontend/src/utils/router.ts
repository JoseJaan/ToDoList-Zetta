import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AuthService } from '../services/AuthService';

type Page = LoginPage | RegisterPage | DashboardPage;

export class Router {
  private currentPage: Page | null = null;
  private appContainer: HTMLElement;
  private authService: AuthService;

  constructor(appContainer: HTMLElement) {
    this.appContainer = appContainer;
    this.authService = AuthService.getInstance();
    this.bindEvents();
    this.init();
  }

  private init(): void {
    if (this.authService.isAuthenticated()) {
      this.navigateTo('dashboard');
    } else {
      this.navigateTo('login');
    }
  }

  private bindEvents(): void {
    window.addEventListener('switchToRegister', () => {
      this.navigateTo('register');
    });

    window.addEventListener('switchToLogin', () => {
      this.navigateTo('login');
    });

    window.addEventListener('navigateToDashboard', () => {
      this.navigateTo('dashboard');
    });
  }

  navigateTo(route: string): void {
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
  }
}