import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { TaskCard } from '../components/tasks/TaskCard';
import { NewTaskModal } from '../components/tasks/NewTaskModal';
import { EditTaskModal } from '../components/tasks/EditTaskModal';
import { TaskService } from '../services/TaskService';
import { AuthService } from '../services/AuthService';
import { Task } from '../types/Task';

export class DashboardPage {
  private header: Header;
  private footer: Footer;
  private taskCards: TaskCard[] = [];
  private newTaskModal: NewTaskModal;
  private taskService: TaskService;
  private authService: AuthService;
  private tasks: Task[] = [];

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
    if (this.tasks.length === 0) {
      return this.renderEmptyState();
    }

    return this.tasks.map(task => {
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

  private renderEmptyState(): string {
    return `
      <div class="col-12">
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3 class="empty-state-title">Nenhuma tarefa encontrada</h3>
          <p class="empty-state-text">Que tal criar sua primeira tarefa?</p>
          <button class="btn btn-new-task" onclick="document.getElementById('newTaskBtn').click()">
            Criar Nova Tarefa
          </button>
        </div>
      </div>
    `;
  }

  bindEvents(): void {
    this.header.bindEvents();
    this.newTaskModal.bindEvents();

    const newTaskBtn = document.getElementById('newTaskBtn');
    newTaskBtn?.addEventListener('click', () => {
      this.newTaskModal.show();
    });

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

  private async loadTasks(): Promise<void> {
    try {
      this.tasks = await this.taskService.getTasks();
      this.updateTasksGrid();
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  }

  private addTask(task: Task): void {
    this.tasks.unshift(task);
    this.updateTasksGrid();
  }

  private updateTask(updatedTask: Task): void {
    const index = this.tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
      this.updateTasksGrid();
    }
  }

  private deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.updateTasksGrid();
  }

  private updateTasksGrid(): void {
    const container = document.getElementById('tasksContainer');
    if (container) {
      container.innerHTML = this.renderTasksGrid();
      
      this.tasks.forEach(task => {
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