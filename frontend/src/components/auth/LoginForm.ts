import { LoginCredentials } from '../../types/Auth';
import { AuthService } from '../../services/AuthService';

export class LoginForm {
  private authService: AuthService;
  private onSuccess: () => void;

  constructor(onSuccess: () => void) {
    this.authService = AuthService.getInstance();
    this.onSuccess = onSuccess;
  }

  render(): string {
    return `
      <div class="auth-container">
        <div class="row min-vh-100 g-0">
          <!-- Seção da Imagem - Desktop -->
          <div class="col-lg-6 d-none d-lg-block auth-image-section">
            <div class="auth-image-container">
              <img src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2339&q=80" 
                   alt="Organizando tarefas" 
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
                      <h1 class="auth-title">ToDo List</h1>
                    </div>
                    
                    <form id="loginForm" class="auth-form">
                      <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" 
                               class="form-control auth-input" 
                               id="email" 
                               name="email" 
                               required>
                      </div>
                      
                      <div class="mb-3">
                        <label for="password" class="form-label">Senha</label>
                        <input type="password" 
                               class="form-control auth-input" 
                               id="password" 
                               name="password" 
                               required>
                        <div class="form-text">
                          <a href="#" id="forgotPassword" class="auth-link-action">Esqueceu a senha?</a>
                        </div>
                      </div>
                      
                      <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-auth">Entrar</button>
                      </div>
                      
                      <div class="text-center">
                        <span class="auth-link">Não tem uma conta? </span>
                        <a href="#" id="switchToRegister" class="auth-link-action">Cadastre-se!</a>
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
    const form = document.getElementById('loginForm') as HTMLFormElement;
    const switchToRegister = document.getElementById('switchToRegister') as HTMLAnchorElement;
    const forgotPassword = document.getElementById('forgotPassword') as HTMLAnchorElement;
    const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const credentials: LoginCredentials = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      };

      try {
        this.showLoading(true);
        this.hideError();
        
        const response = await this.authService.login(credentials);
        this.authService.saveToken(response.token);
        
        this.onSuccess();
      } catch (error) {
        this.showError(error instanceof Error ? error.message : 'Erro ao fazer login');
      } finally {
        this.showLoading(false);
      }
    });

    switchToRegister?.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('switchToRegister'));
    });

    forgotPassword?.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('navigateToForgotPassword'));
    });
  }

  private showLoading(show: boolean): void {
    const button = document.querySelector('.btn-auth') as HTMLButtonElement;
    if (button) {
      button.disabled = show;
      button.innerHTML = show ? 
        '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...' : 
        'Entrar';
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