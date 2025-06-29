import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export class ForgotPasswordPage {
  private forgotPasswordForm: ForgotPasswordForm;

  constructor() {
    this.forgotPasswordForm = new ForgotPasswordForm(() => {
      window.dispatchEvent(new CustomEvent('navigateToLogin'));
    });
  }

  render(): string {
    return `
      <div class="forgot-password-page">
        ${this.forgotPasswordForm.render()}
      </div>
    `;
  }

  bindEvents(): void {
    this.forgotPasswordForm.bindEvents();
  }

  destroy(): void {
  }
}