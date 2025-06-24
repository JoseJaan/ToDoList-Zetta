import { AuthService } from '../../services/AuthService';

export class Header {
  private authService: AuthService;

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
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" id="logoutBtn">
                        <i class="fas fa-sign-out-alt me-2"></i>
                        Sair
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
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.logout();
    });
  }

  private logout(): void {
    if (confirm('Tem certeza que deseja sair?')) {
      this.authService.removeToken();
      window.dispatchEvent(new CustomEvent('switchToLogin'));
    }
  }

  destroy(): void {
  }
}