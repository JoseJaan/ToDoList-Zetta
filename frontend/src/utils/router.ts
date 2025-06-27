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
    const hash = window.location.hash.replace('#', '');
    const initialRoute = hash || (this.authService.isAuthenticated() ? 'dashboard' : 'login');
    this.navigateTo(initialRoute);
  }


  private bindEvents(): void {
    window.addEventListener('popstate', (event) => {
      const route = event.state?.route || 'login';
      this.navigateTo(route, false);
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
  }

  navigateTo(route: string, push: boolean = true): void {
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