import { LoginForm } from '../components/auth/LoginForm';
//import { Header } from '../components/layout/Header';
//import { Footer } from '../components/layout/Footer';

export class LoginPage {
  private loginForm: LoginForm;
  //private header: Header;
  //private footer: Footer;

  constructor() {
    //this.header = new Header();
    //this.footer = new Footer();
    this.loginForm = new LoginForm(() => {
      window.dispatchEvent(new CustomEvent('navigateToDashboard'));
    });
  }

  render(): string {
    return `
      <div class="auth-page">
        ${this.loginForm.render()}
      </div>
    `;
  }

  bindEvents(): void {
    this.loginForm.bindEvents();
  }

  destroy(): void {
  }
}