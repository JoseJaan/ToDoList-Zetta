import { Task, TaskStatus } from '../../types/Task';
import { TaskService } from '../../services/TaskService';

export class NewTaskModal {
  private onTaskCreated: (task: Task) => void;
  private taskService: TaskService;

  constructor(onTaskCreated: (task: Task) => void) {
    this.onTaskCreated = onTaskCreated;
    this.taskService = TaskService.getInstance();
  }

  render(): string {
    return `
      <!-- Modal Nova Tarefa -->
      <div class="modal fade" id="newTaskModal" tabindex="-1" aria-labelledby="newTaskModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="newTaskModalLabel">Nova Tarefa</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="newTaskForm">
                <div class="mb-3">
                  <label for="taskName" class="form-label">Nome da Tarefa *</label>
                  <input type="text" class="form-control" id="taskName" name="name" required>
                </div>

                <div class="mb-3">
                  <label for="taskDescription" class="form-label">Descrição</label>
                  <textarea class="form-control" id="taskDescription" name="description" rows="3" placeholder="Descreva sua tarefa..."></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="taskStatus" class="form-label">Status</label>
                      <select class="form-select" id="taskStatus" name="status">
                        <option value="pending" selected>Pendente</option>
                        <option value="in_progress">Em Progresso</option>
                        <option value="completed">Concluída</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="taskPriority" class="form-label">Prioridade</label>
                      <select class="form-select" id="taskPriority" name="priority">
                        <option value="low">Baixa</option>
                        <option value="medium" selected>Média</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="taskDueDate" class="form-label">Data de Vencimento</label>
                  <input type="date" class="form-control" id="taskDueDate" name="dueDate">
                </div>

                <div id="taskErrorMessage" class="alert alert-danger d-none"></div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" form="newTaskForm" class="btn btn-primary" id="saveTaskBtn">
                Criar Tarefa
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(): void {
    const form = document.getElementById('newTaskForm') as HTMLFormElement;
    const modal = document.getElementById('newTaskModal');
    const errorMessage = document.getElementById('taskErrorMessage');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(form, errorMessage as HTMLDivElement);
    });

    modal?.addEventListener('hidden.bs.modal', () => {
      form?.reset();
      this.hideError();
    });
  }

  private async handleSubmit(form: HTMLFormElement, errorDiv: HTMLDivElement): Promise<void> {
    try {
      this.showLoading(true);
      this.hideError();

      const formData = new FormData(form);
      const taskData = this.getTaskDataFromForm(formData);

      const newTask = await this.taskService.createTask(taskData);
      
      this.onTaskCreated(newTask);
      this.hide();
      
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'Erro ao criar tarefa');
    } finally {
      this.showLoading(false);
    }
  }

  private getTaskDataFromForm(formData: FormData): Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'expanded'> {
    const dueDate = formData.get('dueDate') as string;
    const name = formData.get('name');
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('O nome da tarefa é obrigatório.');
    }
    return {
      name: name,
      description: (formData.get('description') as string) || '',
      status: formData.get('status') as TaskStatus,
    };
  }

  private showLoading(show: boolean): void {
    const button = document.getElementById('saveTaskBtn') as HTMLButtonElement;
    if (button) {
      button.disabled = show;
      button.innerHTML = show ? 
        '<span class="spinner-border spinner-border-sm me-2"></span>Criando...' : 
        'Criar Tarefa';
    }
  }

  private showError(message: string): void {
    const errorDiv = document.getElementById('taskErrorMessage') as HTMLDivElement;
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('d-none');
    }
  }

  private hideError(): void {
    const errorDiv = document.getElementById('taskErrorMessage') as HTMLDivElement;
    if (errorDiv) {
      errorDiv.classList.add('d-none');
    }
  }

  show(): void {
    const modal = document.getElementById('newTaskModal');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  hide(): void {
    const modal = document.getElementById('newTaskModal');
    if (modal) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    }
  }

  destroy(): void {
    const modal = document.getElementById('newTaskModal');
    if (modal) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.dispose();
      }
    }
  }
}