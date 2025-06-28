import { RegisterForm } from '../components/auth/RegisterForm';

export class RegisterPage {
  private registerForm: RegisterForm;

  constructor() {
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