import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { TaskCard } from '../components/tasks/TaskCard';
import { NewTaskModal } from '../components/tasks/NewTaskModal';
import { EditTaskModal } from '../components/tasks/EditTaskModal';
import { TaskService } from '../services/TaskService';
import { AuthService } from '../services/AuthService';
import { Task, TaskStatus } from '../types/Task';

export class DashboardPage {
  private header: Header;
  private footer: Footer;
  private taskCards: TaskCard[] = [];
  private newTaskModal: NewTaskModal;
  private taskService: TaskService;
  private authService: AuthService;
  private tasks: Task[] = [];
  private currentFilter: TaskStatus | 'todas' = 'todas';

  constructor() {
    this.header = new Header();
    this.footer = new Footer();
    this.taskService = TaskService.getInstance();
    this.authService = AuthService.getInstance();
    this.newTaskModal = new NewTaskModal((task: Task) => {
      this.addTask(task);
    });
  }

  render(): string {
    const greeting = this.getRandomGreeting();
    const userNickname = this.authService.getUserNickname() || 'Usuário';

    return `
      <div class="dashboard-page">
        ${this.header.render()}
        
        <main class="dashboard-main">
          <div class="container-fluid px-3 px-md-4">
            <!-- Header com saudação -->
            <div class="row mb-4">
              <div class="col-12">
                <div class="dashboard-header">
                  <h1 class="dashboard-greeting">${greeting}, ${userNickname}!</h1>
                  <button class="btn btn-new-task" id="newTaskBtn">
                    Nova Tarefa
                  </button>
                </div>
              </div>
            </div>

            <!-- Filtros de Status -->
            <div class="row mb-4">
              <div class="col-12">
                <div class="task-filters">
                  <div class="filter-buttons">
                    <button class="btn btn-filter ${this.currentFilter === 'todas' ? 'active' : ''}" 
                            data-filter="todas" id="filterAll">
                      Todas (${this.tasks.length})
                    </button>
                    <button class="btn btn-filter ${this.currentFilter === 'pendente' ? 'active' : ''}" 
                            data-filter="pendente" id="filterPending">
                      Pendentes (${this.getTaskCountByStatus('pendente')})
                    </button>
                    <button class="btn btn-filter ${this.currentFilter === 'concluida' ? 'active' : ''}" 
                            data-filter="concluida" id="filterCompleted">
                      Concluídas (${this.getTaskCountByStatus('concluida')})
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Grid de Tarefas -->
            <div class="row" id="tasksContainer">
              ${this.renderTasksGrid()}
            </div>
          </div>
        </main>

        ${this.footer.render()}
        ${this.newTaskModal.render()}
      </div>
    `;
  }

  private renderTasksGrid(): string {
    const filteredTasks = this.getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      return this.renderEmptyState();
    }

    return filteredTasks.map(task => {
      const taskCard = new TaskCard(task, (updatedTask) => {
        this.updateTask(updatedTask);
      }, (taskId) => {
        this.deleteTask(taskId);
      });
      
      return `
        <div class="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
          ${taskCard.render()}
        </div>
      `;
    }).join('');
  }

  private getFilteredTasks(): Task[] {
    if (this.currentFilter === 'todas') {
      return this.tasks;
    }
    return this.tasks.filter(task => task.status === this.currentFilter);
  }

  private getTaskCountByStatus(status: TaskStatus): number {
    return this.tasks.filter(task => task.status === status).length;
  }

  private renderEmptyState(): string {
    const filterMessage = this.getEmptyStateMessage();
    
    return `
      <div class="col-12">
        <div class="empty-state">
          <div class="empty-state-icon">${this.getEmptyStateIcon()}</div>
          <h3 class="empty-state-title">${filterMessage.title}</h3>
          <p class="empty-state-text">${filterMessage.text}</p>
          ${this.currentFilter === 'todas' ? `
            <button class="btn btn-new-task" onclick="document.getElementById('newTaskBtn').click()">
              Criar Nova Tarefa
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  private getEmptyStateMessage(): { title: string; text: string } {
    switch (this.currentFilter) {
      case 'pendente':
        return {
          title: 'Nenhuma tarefa pendente',
          text: 'Parabéns! Você não tem tarefas pendentes no momento.'
        };
      case 'concluida':
        return {
          title: 'Nenhuma tarefa concluída',
          text: 'Você ainda não concluiu nenhuma tarefa.'
        };
      default:
        return {
          title: 'Nenhuma tarefa encontrada',
          text: 'Que tal criar sua primeira tarefa?'
        };
    }
  }

  private getEmptyStateIcon(): string {
    switch (this.currentFilter) {
      case 'pendente':
        return '🎉';
      case 'concluida':
        return '📋';
      default:
        return '📝';
    }
  }

  bindEvents(): void {
    this.header.bindEvents();
    this.newTaskModal.bindEvents();

    const newTaskBtn = document.getElementById('newTaskBtn');
    newTaskBtn?.addEventListener('click', () => {
      this.newTaskModal.show();
    });

    this.bindFilterEvents();

    window.addEventListener('editTask', (event: Event) => {
      const customEvent = event as CustomEvent;
      const task = customEvent.detail.task as Task;

      const container = document.createElement('div');
      document.body.appendChild(container);

      const modal = new EditTaskModal(task, (updatedTask) => {
        this.updateTask(updatedTask);
        document.body.removeChild(container);
      });

      container.innerHTML = modal.render();
      modal.bindEvents();
      modal.show();
    });

    this.loadTasks();
  }

  private bindFilterEvents(): void {
    const filterButtons = document.querySelectorAll('[data-filter]');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const filter = target.getAttribute('data-filter') as TaskStatus | 'todas';
        
        if (filter && filter !== this.currentFilter) {
          this.setFilter(filter);
        }
      });
    });
  }

  private setFilter(filter: TaskStatus | 'todas'): void {
    this.currentFilter = filter;
    
    this.updateFilterButtons();
    
    this.updateTasksGrid();
  }

  private updateFilterButtons(): void {
    const filterButtons = document.querySelectorAll('[data-filter]');
    
    filterButtons.forEach(button => {
      const buttonFilter = button.getAttribute('data-filter');
      button.classList.toggle('active', buttonFilter === this.currentFilter);
      
      if (buttonFilter === 'todas') {
        button.textContent = `Todas (${this.tasks.length})`;
      } else if (buttonFilter === 'pendente') {
        button.textContent = `Pendentes (${this.getTaskCountByStatus('pendente')})`;
      } else if (buttonFilter === 'concluida') {
        button.textContent = `Concluídas (${this.getTaskCountByStatus('concluida')})`;
      }
    });
  }

  private async loadTasks(): Promise<void> {
    try {
      this.tasks = await this.taskService.getTasks();
      this.updateTasksGrid();
      this.updateFilterButtons();
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  }

  private addTask(task: Task): void {
    this.tasks.unshift(task);
    this.updateTasksGrid();
    this.updateFilterButtons();
  }

  private updateTask(updatedTask: Task): void {
    const index = this.tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
      this.updateTasksGrid();
      this.updateFilterButtons();
    }
  }

  private deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.updateTasksGrid();
    this.updateFilterButtons();
  }

  private updateTasksGrid(): void {
    const container = document.getElementById('tasksContainer');
    if (container) {
      container.innerHTML = this.renderTasksGrid();
      
      const filteredTasks = this.getFilteredTasks();
      filteredTasks.forEach(task => {
        const taskCard = new TaskCard(task, (updatedTask) => {
          this.updateTask(updatedTask);
        }, (taskId) => {
          this.deleteTask(taskId);
        });
        taskCard.bindEvents();
      });
    }
  }

  private getRandomGreeting(): string {
    const greetings = [
      'Olá',
      'E aí',
      'Oi',
      'Seja bem-vindo(a)',
      'Como vai',
      'Que bom te ver'
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  destroy(): void {
    this.header.destroy();
    this.footer.destroy();
    this.newTaskModal.destroy();
    this.taskCards.forEach(card => card.destroy());
  }
}