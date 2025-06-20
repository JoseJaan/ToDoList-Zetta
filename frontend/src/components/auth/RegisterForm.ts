import { RegisterData } from '../../types/Auth';
import { AuthService } from '../../services/AuthService';

export class RegisterForm {
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
          <!-- Seção do Formulário - Tela Cheia -->
          <div class="col-12 d-flex align-items-center justify-content-center auth-form-section">
            <div class="container-fluid">
              <div class="row justify-content-center">
                <div class="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4">
                  <div class="auth-card">
                    <div class="text-center mb-4">
                      <h1 class="auth-title">ToDo List</h1>
                    </div>
                    
                    <form id="registerForm" class="auth-form">
                      <div class="mb-3">
                        <label for="name" class="form-label">Nome Completo</label>
                        <input type="text" 
                               class="form-control auth-input" 
                               id="name" 
                               name="name" 
                               required>
                      </div>
                      
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
                      </div>
                      
                      <div class="mb-3">
                        <label for="displayName" class="form-label">Como gostaria de ser chamado?</label>
                        <input type="text" 
                               class="form-control auth-input" 
                               id="displayName" 
                               name="displayName" 
                               placeholder="Nome de exibição (opcional)">
                      </div>
                      
                      <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-auth">Cadastrar</button>
                      </div>
                      
                      <div class="text-center">
                        <span class="auth-link">Já tem uma conta? </span>
                        <a href="#" id="switchToLogin" class="auth-link-action">Entre aqui!</a>
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
    const form = document.getElementById('registerForm') as HTMLFormElement;
    const switchToLogin = document.getElementById('switchToLogin') as HTMLAnchorElement;
    const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;

    // Evento de submit do formulário
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const userData: RegisterData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        displayName: formData.get('displayName') as string || undefined,
      };

      try {
        this.showLoading(true);
        this.hideError();
        
        const response = await this.authService.register(userData);
        this.authService.saveToken(response.token);
        
        this.onSuccess();
      } catch (error) {
        this.showError(error instanceof Error ? error.message : 'Erro ao cadastrar usuário');
      } finally {
        this.showLoading(false);
      }
    });

    // Evento para trocar para login
    switchToLogin?.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('switchToLogin'));
    });
  }

  private showLoading(show: boolean): void {
    const button = document.querySelector('.btn-auth') as HTMLButtonElement;
    if (button) {
      button.disabled = show;
      button.innerHTML = show ? 
        '<span class="spinner-border spinner-border-sm me-2"></span>Cadastrando...' : 
        'Cadastrar';
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