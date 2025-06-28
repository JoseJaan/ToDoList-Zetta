import { AuthService } from '../../services/AuthService';

export class Header {
  private authService: AuthService;
  private cleanupFunctions: (() => void)[] = [];

  constructor() {
    this.authService = AuthService.getInstance();
  }

  render(): string {
    const userNickname = this.authService.getUserNickname() || 'Usuário';
    
    return `
      <header class="app-header">
        <nav class="navbar navbar-expand-lg">
          <div class="container-fluid px-3 px-md-4">
            <!-- Logo/Brand -->
            <a class="navbar-brand" href="#">
              <span class="brand-text">ToDo List</span>
            </a>
            
            <!-- Toggle button for mobile -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            
            <!-- Navigation items -->
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav ms-auto align-items-center">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle user-dropdown" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="user-avatar">
                      <span class="user-initial">${userNickname.charAt(0).toUpperCase()}</span>
                    </div>
                    <span class="user-name d-none d-md-inline">${userNickname}</span>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <a class="dropdown-item text-danger" href="#" id="logoutBtn">
                        <i class="fas fa-sign-out-alt me-2"></i>
                        Sair
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" id="deleteAccountBtn">
                        <i class="fas fa-trash-alt me-2"></i>
                        Excluir Conta
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    `;
  }

  bindEvents(): void {
    this.initializeDropdown();

    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    logoutBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleLogout();
    });

    deleteAccountBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleDeleteAccount();
    });
  }

  private initializeDropdown(): void {
    const dropdownToggle = document.getElementById('userDropdown');
    const dropdownMenu = dropdownToggle?.nextElementSibling as HTMLElement;
    
    if (!dropdownToggle || !dropdownMenu) return;

    if (typeof (window as any).bootstrap !== 'undefined') {
      new (window as any).bootstrap.Dropdown(dropdownToggle);
    } else if (typeof (window as any).$ !== 'undefined' && (window as any).$.fn.dropdown) {
      ((window as any).$(dropdownToggle) as any).dropdown();
    } else {
      this.setupManualDropdown(dropdownToggle, dropdownMenu);
    }
  }

  private setupManualDropdown(toggle: HTMLElement, menu: HTMLElement): void {
    let isOpen = false;

    const toggleDropdown = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isOpen) {
        this.closeDropdown(menu);
      } else {
        this.openDropdown(menu);
      }
      isOpen = !isOpen;
    };

    const closeOnClickOutside = (e: Event) => {
      if (!toggle.contains(e.target as Node) && !menu.contains(e.target as Node)) {
        if (isOpen) {
          this.closeDropdown(menu);
          isOpen = false;
        }
      }
    };

    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        this.closeDropdown(menu);
        isOpen = false;
      }
    };

    toggle.addEventListener('click', toggleDropdown);
    document.addEventListener('click', closeOnClickOutside);
    document.addEventListener('keydown', closeOnEscape);

    this.cleanupFunctions = this.cleanupFunctions || [];
    this.cleanupFunctions.push(() => {
      toggle.removeEventListener('click', toggleDropdown);
      document.removeEventListener('click', closeOnClickOutside);
      document.removeEventListener('keydown', closeOnEscape);
    });
  }

  private openDropdown(menu: HTMLElement): void {
    menu.classList.add('show');
    menu.style.display = 'block';
    
    const rect = menu.previousElementSibling?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < menu.offsetHeight && spaceAbove > spaceBelow) {
        menu.classList.add('dropup');
      }
    }
  }

  private closeDropdown(menu: HTMLElement): void {
    menu.classList.remove('show');
    menu.classList.remove('dropup');
    menu.style.display = '';
  }

  private async handleLogout(): Promise<void> {
    if (confirm('Tem certeza que deseja sair?')) {
      try {
        this.showLoading('Fazendo logout...');
        
        await this.authService.logout();
        
        this.hideLoading();
        
        window.dispatchEvent(new CustomEvent('switchToLogin'));
        
      } catch (error) {
        this.hideLoading();
        console.error('Erro ao fazer logout:', error);
        this.showAlert('Erro ao fazer logout. Tente novamente.', 'error');
      }
    }
  }

  private async handleDeleteAccount(): Promise<void> {
    const userInfo = this.authService.getUserInfo();
    
    if (!userInfo?.id) {
      this.showAlert('Erro: informações do usuário não encontradas.', 'error');
      return;
    }

    const firstConfirm = confirm('⚠️ ATENÇÃO: Esta ação irá excluir permanentemente sua conta e todos os seus dados. Esta ação não pode ser desfeita.\n\nTem certeza que deseja continuar?');
    
    if (!firstConfirm) return;

    const secondConfirm = confirm('Esta é sua última chance! Confirma que deseja excluir sua conta permanentemente?');
    
    if (!secondConfirm) return;

    try {
      this.showLoading('Excluindo conta...');
      
      await this.authService.deleteAccount(userInfo.id);
      
      this.hideLoading();

      this.showAlert('Conta excluída com sucesso.', 'success');
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('switchToLogin'));
      }, 2000);
      
    } catch (error) {
      this.hideLoading();
      console.error('Erro ao excluir conta:', error);
      this.showAlert('Erro ao excluir conta. Tente novamente.', 'error');
    }
  }

  private showLoading(message: string): void {
    this.hideLoading();
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'header-loading';
    loadingDiv.className = 'header-loading';
    loadingDiv.innerHTML = `
      <div class="loading-backdrop">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>${message}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(loadingDiv);
  }

  private hideLoading(): void {
    const loading = document.getElementById('header-loading');
    if (loading) {
      loading.remove();
    }
  }

  private showAlert(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const existingAlert = document.getElementById('header-alert');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.id = 'header-alert';
    alertDiv.className = `header-alert alert-${type}`;
    alertDiv.innerHTML = `
      <div class="alert-content">
        <span class="alert-message">${message}</span>
        <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      if (alertDiv && alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }

  destroy(): void {
    this.hideLoading();
    const alert = document.getElementById('header-alert');
    if (alert) {
      alert.remove();
    }
    
    if (this.cleanupFunctions) {
      this.cleanupFunctions.forEach(cleanup => cleanup());
      this.cleanupFunctions = [];
    }
  }
}