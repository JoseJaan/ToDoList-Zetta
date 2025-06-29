import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';

export class ResetPasswordPage {
  private resetPasswordForm: ResetPasswordForm;
  private token: string;
  private isTokenValid: boolean = false;

  constructor(token: string) {
    this.token = token;
    this.resetPasswordForm = new ResetPasswordForm(
      token,
      () => {
        //Sucesso - redirecionar para login com mensagem
        this.showSuccessAndRedirect();
      },
      () => {
        //Token inválido - redirecionar para forgot password
        this.showInvalidTokenAndRedirect();
      }
    );
  }

  async render(): Promise<string> {
    //Valida o token antes de renderizar
    this.isTokenValid = await this.resetPasswordForm.validateToken();
    
    if (!this.isTokenValid) {
      return this.renderInvalidToken();
    }

    return `
      <div class="reset-password-page">
        ${this.resetPasswordForm.render()}
      </div>
    `;
  }

  bindEvents(): void {
    if (this.isTokenValid) {
      this.resetPasswordForm.bindEvents();
    } else {
      this.bindInvalidTokenEvents();
    }
  }

  private bindInvalidTokenEvents(): void {
    console.log("Ta aqui")
    const requestNewResetBtn = document.getElementById('requestNewReset');
    const backToLoginBtn = document.getElementById('backToLogin');

    requestNewResetBtn?.addEventListener('click', (e) => {
      console.log("Identificou clique")
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('navigateToForgotPassword'));
    });

    backToLoginBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('switchToLogin'));
    });
  }

  destroy(): void {
    // Cleanup se necessário
  }

  private renderInvalidToken(): string {
    return `
      <div class="auth-container">
        <div class="row min-vh-100 g-0">
          <div class="col-12 d-flex align-items-center justify-content-center auth-form-section">
            <div class="container-fluid">
              <div class="row justify-content-center">
                <div class="col-11 col-sm-8 col-md-6 col-lg-4">
                  <div class="auth-card text-center">
                    <div class="mb-4">
                      <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                    </div>
                    <h2 class="auth-title mb-3">Token Inválido</h2>
                    <p class="text-muted mb-4">
                      O link de redefinição de senha é inválido ou expirou. 
                      Solicite uma nova redefinição de senha.
                    </p>
                    <div class="d-grid gap-2">
                      <button id="requestNewReset" class="btn btn-auth">
                        Solicitar Nova Redefinição
                      </button>
                      <a href="#" id="backToLogin" class="auth-link-action">
                        Voltar para o login
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private showSuccessAndRedirect(): void {
    const container = document.querySelector('.reset-password-page') as HTMLElement;
    if (container) {
      container.innerHTML = `
        <div class="auth-container">
          <div class="row min-vh-100 g-0">
            <div class="col-12 d-flex align-items-center justify-content-center auth-form-section">
              <div class="container-fluid">
                <div class="row justify-content-center">
                  <div class="col-11 col-sm-8 col-md-6 col-lg-4">
                    <div class="auth-card text-center">
                      <div class="mb-4">
                        <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
                      </div>
                      <h2 class="auth-title mb-3">Senha Redefinida!</h2>
                      <p class="text-muted mb-4">
                        Sua senha foi redefinida com sucesso. 
                        Você será redirecionado para o login em <span id="countdown">5</span> segundos.
                      </p>
                      <div class="d-grid">
                        <button id="goToLogin" class="btn btn-auth">
                          Ir para Login Agora
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      let seconds = 5;
      const countdownElement = document.getElementById('countdown');
      const countdownInterval = setInterval(() => {
        seconds--;
        if (countdownElement) {
          countdownElement.textContent = seconds.toString();
        }
        if (seconds <= 0) {
          clearInterval(countdownInterval);
          window.dispatchEvent(new CustomEvent('switchToLogin'));
        }
      }, 1000);

      const goToLoginBtn = document.getElementById('goToLogin');
      goToLoginBtn?.addEventListener('click', () => {
        clearInterval(countdownInterval);
        window.dispatchEvent(new CustomEvent('switchToLogin'));
      });
    }
  }

  private showInvalidTokenAndRedirect(): void {
    window.dispatchEvent(new CustomEvent('navigateToForgotPassword'));
  }
}