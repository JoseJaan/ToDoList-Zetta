import { AuthService } from '../../services/AuthService';

export class ForgotPasswordForm {
  private authService: AuthService;
  private onBackToLogin: () => void;

  constructor(onBackToLogin: () => void) {
    this.authService = AuthService.getInstance();
    this.onBackToLogin = onBackToLogin;
  }

  render(): string {
    return `
      <div class="auth-container">
        <div class="row min-vh-100 g-0">
          <!-- Seção da Imagem - Desktop -->
          <div class="col-lg-6 d-none d-lg-block auth-image-section">
            <div class="auth-image-container">
              <img src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2339&q=80" 
                   alt="Redefinir senha" 
                   class="img-fluid h-100 w-100 object-fit-cover">
            </div>
          </div>
          
          <!-- Seção do Formulário -->
          <div class="col-lg-6 d-flex align-items-center justify-content-center auth-form-section">
            <div class="container-fluid">
              <div class="row justify-content-center">
                <div class="col-11 col-sm-8 col-md-6 col-lg-10 col-xl-8">
                  <div class="auth-card">
                    <div class="text-center mb-4">
                      <h1 class="auth-title">Esqueceu a senha?</h1>
                      <p class="text-muted">Digite seu email para receber as instruções de redefinição</p>
                    </div>
                    
                    <form id="forgotPasswordForm" class="auth-form">
                      <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" 
                               class="form-control auth-input" 
                               id="email" 
                               name="email" 
                               placeholder="seu@email.com"
                               required>
                      </div>
                      
                      <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-auth">Enviar Instruções</button>
                      </div>
                      
                      <div class="text-center">
                        <a href="#" id="backToLogin" class="auth-link-action">
                          ← Voltar para o login
                        </a>
                      </div>
                    </form>
                    
                    <div id="successMessage" class="alert alert-success mt-3 d-none"></div>
                    <div id="errorMessage" class="alert alert-danger mt-3 d-none"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(): void {
    const form = document.getElementById('forgotPasswordForm') as HTMLFormElement;
    const backToLogin = document.getElementById('backToLogin') as HTMLAnchorElement;
    
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const email = formData.get('email') as string;

      try {
        this.showLoading(true);
        this.hideMessages();
        
        await this.authService.forgotPassword(email);
        
        this.showSuccess('Se o email existir em nossa base, você receberá as instruções para redefinir sua senha.');
        form.reset();
        
      } catch (error) {
        this.showError(error instanceof Error ? error.message : 'Erro ao solicitar redefinição');
      } finally {
        this.showLoading(false);
      }
    });

    backToLogin?.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('switchToLogin'));
    });
  }

  private showLoading(show: boolean): void {
    const button = document.querySelector('.btn-auth') as HTMLButtonElement;
    if (button) {
      button.disabled = show;
      button.innerHTML = show ? 
        '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...' : 
        'Enviar Instruções';
    }
  }

  private showSuccess(message: string): void {
    const successDiv = document.getElementById('successMessage') as HTMLDivElement;
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.classList.remove('d-none');
    }
  }

  private showError(message: string): void {
    const errorDiv = document.getElementById('errorMessage') as HTMLDivElement;
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('d-none');
    }
  }

  private hideMessages(): void {
    const successDiv = document.getElementById('successMessage') as HTMLDivElement;
    const errorDiv = document.getElementById('errorMessage') as HTMLDivElement;
    
    if (successDiv) successDiv.classList.add('d-none');
    if (errorDiv) errorDiv.classList.add('d-none');
  }
}