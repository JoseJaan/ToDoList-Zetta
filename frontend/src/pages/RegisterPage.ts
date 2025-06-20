import { RegisterForm } from '../components/auth/RegisterForm';
//import { Header } from '../components/layout/Header';
//import { Footer } from '../components/layout/Footer';

export class RegisterPage {
  private registerForm: RegisterForm;
  //private header: Header;
  //private footer: Footer;

  constructor() {
    //this.header = new Header();
    //this.footer = new Footer();
    this.registerForm = new RegisterForm(() => {
      window.dispatchEvent(new CustomEvent('navigateToDashboard'));
    });
  }

  render(): string {
    return `
      <div class="auth-page">
        ${this.registerForm.render()}
      </div>
    `;
  }

  bindEvents(): void {
    this.registerForm.bindEvents();
  }

  destroy(): void {
  }
}