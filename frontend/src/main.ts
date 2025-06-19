import './styles/main.scss';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//import { Header } from './components/layout/Header';
//import { Footer } from './components/layout/Footer';

interface App {
  init(): void;
  render(): void;
}

class TodoApp implements App {
  //private header: Header;
  //private footer: Footer;
  private appContainer: HTMLElement;

  constructor() {
    this.appContainer = document.getElementById('app') as HTMLElement;
    //this.header = new Header();
    //this.footer = new Footer();
  }

  init(): void {
    this.render();
    this.bindEvents();
  }

  render(): void {
    this.appContainer.innerHTML = `
      <div class="d-flex flex-column min-vh-100">
        
        <main class="flex-grow-1">
          <div class="container-fluid py-4">
            <div class="row justify-content-center">
              <div class="col-12 col-md-8 col-lg-6">
                <div class="card shadow">
                  <div class="card-header">
                    <h1 class="h3 mb-0 text-center">Minhas Tarefas</h1>
                  </div>
                  <div class="card-body">
                    <p class="text-center text-muted">
                      Aplicação carregada com sucesso!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
      </div>
    `;
  }

  private bindEvents(): void {
    console.log('TodoApp inicializada com sucesso!');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new TodoApp();
  app.init();
});