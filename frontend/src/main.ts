import './styles/main.scss';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Router } from './utils/router';
import * as bootstrap from 'bootstrap';
(window as any).bootstrap = bootstrap;


document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app') as HTMLElement;
  
  if (!appContainer) {
    throw new Error('Elemento #app não encontrado');
  }
  
  new Router(appContainer);
  
  console.log('TodoApp inicializada com sucesso!');
});