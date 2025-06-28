import { LoginForm } from '../components/auth/LoginForm';
export class LoginPage {
  private loginForm: LoginForm;

  constructor() {
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