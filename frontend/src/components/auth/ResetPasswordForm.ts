import { AuthService } from '../../services/AuthService';

export class ResetPasswordForm {
  private authService: AuthService;
  private token: string;
  private onSuccess: () => void;
  private onInvalidToken: () => void;

  constructor(token: string, onSuccess: () => void, onInvalidToken: () => void) {
    this.authService = AuthService.getInstance();
    this.token = token;
    this.onSuccess = onSuccess;
    this.onInvalidToken = onInvalidToken;
  }

  async validateToken(): Promise<boolean> {
    const isValid = await this.authService.validateResetToken(this.token);
    if (!isValid) {
      this.onInvalidToken();
    }
    return isValid;
  }

  render(): string {
    return `
      <div class="auth-container">
        <div class="row min-vh-100 g-0">
          <!-- Seção da Imagem - Desktop -->
          <div class="col-lg-6 d-none d-lg-block auth-image-section">
            <div class="auth-image-container">
              <img src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2339&q=80" 
                   alt="Nova senha" 
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
                      <h1 class="auth-title">Nova Senha</h1>
                      <p class="text-muted">Digite sua nova senha abaixo</p>
                    </div>
                    
                    <form id="resetPasswordForm" class="auth-form">
                      <div class="mb-3">
                        <label for="newPassword" class="form-label">Nova Senha</label>
                        <input type="password" 
                               class="form-control auth-input" 
                               id="newPassword" 
                               name="newPassword" 
                               placeholder="Digite sua nova senha"
                               minlength="6"
                               required>
                        <div class="form-text">Mínimo de 6 caracteres</div>
                      </div>
                      
                      <div class="mb-3">
                        <label for="confirmPassword" class="form-label">Confirmar Nova Senha</label>
                        <input type="password" 
                               class="form-control auth-input" 
                               id="confirmPassword" 
                               name="confirmPassword" 
                               placeholder="Confirme sua nova senha"
                               minlength="6"
                               required>
                      </div>
                      
                      <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-auth">Redefinir Senha</button>
                      </div>
                      
                      <div class="text-center">
                        <a href="#" id="backToLogin" class="auth-link-action">
                          ← Voltar para o login
                        </a>
                      </div>
                    </form>
                    
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
    const form = document.getElementById('resetPasswordForm') as HTMLFormElement;
    const backToLogin = document.getElementById('backToLogin') as HTMLAnchorElement;
    const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    
    const validatePasswords = () => {
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      
      if (confirmPassword && newPassword !== confirmPassword) {
        confirmPasswordInput.setCustomValidity('As senhas não coincidem');
      } else {
        confirmPasswordInput.setCustomValidity('');
      }
    };

    newPasswordInput?.addEventListener('input', validatePasswords);
    confirmPasswordInput?.addEventListener('input', validatePasswords);
    
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const newPassword = formData.get('newPassword') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (newPassword !== confirmPassword) {
        this.showError('As senhas não coincidem');
        return;
      }

      if (newPassword.length < 6) {
        this.showError('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      try {
        this.showLoading(true);
        this.hideError();
        
        await this.authService.resetPassword(this.token, newPassword);
        this.onSuccess();
        
      } catch (error) {
        this.showError(error instanceof Error ? error.message : 'Erro ao redefinir senha');
      } finally {
        this.showLoading(false);
      }
    });

    backToLogin?.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("[backToLogin] Detectou");
      window.dispatchEvent(new CustomEvent('switchToLogin'));
    });
  }

  private showLoading(show: boolean): void {
    const button = document.querySelector('.btn-auth') as HTMLButtonElement;
    if (button) {
      button.disabled = show;
      button.innerHTML = show ? 
        '<span class="spinner-border spinner-border-sm me-2"></span>Redefinindo...' : 
        'Redefinir Senha';
    }
  }

  private showError(message: string): void {
    const errorDiv = document.getElementById('errorMessage') as HTMLDivElement;
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('d-none');
    }
  }

  private hideError(): void {
    const errorDiv = document.getElementById('errorMessage') as HTMLDivElement;
    if (errorDiv) {
      errorDiv.classList.add('d-none');
    }
  }
}