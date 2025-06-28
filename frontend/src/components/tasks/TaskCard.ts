import { Task, TaskStatus } from '../../types/Task';
import { TaskService } from '../../services/TaskService';

export class TaskCard {
  private task: Task;
  private onUpdate: (task: Task) => void;
  private onDelete: (taskId: string) => void;
  private taskService: TaskService;

  constructor(
    task: Task,
    onUpdate: (task: Task) => void,
    onDelete: (taskId: string) => void
  ) {
    this.task = task;
    this.onUpdate = onUpdate;
    this.onDelete = onDelete;
    this.taskService = TaskService.getInstance();
  }

  render(): string {
    const statusClass = this.getStatusClass();
    const statusText = this.getStatusText();
    const statusIcon = this.getStatusIcon();

    return `
      <div class="task-card ${statusClass}" data-task-id="${this.task.id}">
        <div class="task-card-header">
          <h5 class="task-card-title">${this.task.name}</h5>
          <div class="task-card-actions">
            <button class="btn btn-sm btn-outline-primary task-edit-btn" title="Editar">
              <i class="fas fa-edit"></i>
              <span class="btn-text">Editar</span>
            </button>
            <button class="btn btn-sm btn-outline-danger task-delete-btn" title="Excluir">
              <i class="fas fa-trash"></i>
              <span class="btn-text">Excluir</span>
            </button>
          </div>
        </div>

        ${this.task.description ? `
          <div class="task-card-description">
            <p>${this.task.description}</p>
          </div>
        ` : ''}

        <div class="task-card-footer">
          <div class="task-status">
            <span class="task-status-icon">${statusIcon}</span>
            <span class="task-status-text">${statusText}</span>
          </div>

          <div class="task-card-toggle">
            <button class="btn btn-sm task-toggle-btn" title="Expandir/Recolher">
              <i class="fas fa-chevron-${this.task.expanded ? 'up' : 'down'}"></i>
              <span class="btn-text">${this.task.expanded ? 'Ver menos' : 'Ver mais'}</span>
            </button>
          </div>
        </div>

        ${this.task.expanded ? `
          <div class="task-card-expanded">
            <div class="task-actions-expanded">
              <select class="form-select form-select-sm task-status-select">
                <option value="pendente" ${this.task.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                <option value="concluida" ${this.task.status === 'concluida' ? 'selected' : ''}>Concluída</option>
              </select>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  bindEvents(): void {
    const card = document.querySelector(`[data-task-id="${this.task.id}"]`);
    if (!card) return;

    const toggleBtn = card.querySelector('.task-toggle-btn');
    toggleBtn?.addEventListener('click', () => {
      this.toggleExpanded();
    });

    const editBtn = card.querySelector('.task-edit-btn');
    editBtn?.addEventListener('click', () => {
      this.editTask();
    });

    const deleteBtn = card.querySelector('.task-delete-btn');
    deleteBtn?.addEventListener('click', () => {
      this.deleteTask();
    });

    const statusSelect = card.querySelector('.task-status-select') as HTMLSelectElement;
    statusSelect?.addEventListener('change', () => {
      this.updateStatus(statusSelect.value as TaskStatus);
    });
  }

  private getStatusClass(): string {
    switch (this.task.status) {
      case 'concluida':
        return 'task-card-completed';
      case 'pendente':
      default:
        return 'task-card-pending';
    }
  }

  private getStatusText(): string {
    switch (this.task.status) {
      case 'concluida':
        return 'Concluída';
      case 'pendente':
      default:
        return 'Pendente';
    }
  }

  private getStatusIcon(): string {
    switch (this.task.status) {
      case 'concluida':
        return '✅';
      case 'pendente':
      default:
        return '📋';
    }
  }

  private toggleExpanded(): void {
    this.task.expanded = !this.task.expanded;
    this.refreshCard();
  }

  private async updateStatus(newStatus: TaskStatus): Promise<void> {
    try {
      const updatedTask = await this.taskService.updateTask({
        ...this.task,
        status: newStatus
      });
      this.task = updatedTask;
      this.onUpdate(updatedTask);
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
    }
  }

  private editTask(): void {
    window.dispatchEvent(new CustomEvent('editTask', {
      detail: { task: this.task }
    }));
  }

  private async deleteTask(): Promise<void> {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await this.taskService.deleteTask(this.task.id);
        this.onDelete(this.task.id);
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
      }
    }
  }

  private refreshCard(): void {
    const card = document.querySelector(`[data-task-id="${this.task.id}"]`);
    if (card) {
      card.outerHTML = this.render();
      this.bindEvents();
    }
  }

  destroy(): void {
  }
}