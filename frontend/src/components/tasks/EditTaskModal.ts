import { Task, TaskStatus } from '../../types/Task';
import { TaskService } from '../../services/TaskService';

export class EditTaskModal {
  private task: Task;
  private onTaskUpdated: (task: Task) => void;
  private taskService: TaskService;

  constructor(task: Task, onTaskUpdated: (task: Task) => void) {
    this.task = task;
    this.onTaskUpdated = onTaskUpdated;
    this.taskService = TaskService.getInstance();
  }

  render(): string {
    return `
      <div class="modal fade" id="editTaskModal" tabindex="-1" aria-labelledby="editTaskModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Editar Tarefa</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <form id="editTaskForm">
                <div class="mb-3">
                  <label for="editTaskName" class="form-label">Nome *</label>
                  <input type="text" class="form-control" id="editTaskName" name="name" required value="${this.task.name}">
                </div>

                <div class="mb-3">
                  <label for="editTaskDescription" class="form-label">Descrição</label>
                  <textarea class="form-control" id="editTaskDescription" name="description" rows="3">${this.task.description || ''}</textarea>
                </div>

                <div class="mb-3">
                  <label for="editTaskStatus" class="form-label">Status</label>
                  <select class="form-select" id="editTaskStatus" name="status">
                    <option value="pendente" ${this.task.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                    <option value="concluida" ${this.task.status === 'concluida' ? 'selected' : ''}>Concluída</option>
                  </select>
                </div>

                <div id="editTaskErrorMessage" class="alert alert-danger d-none"></div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" form="editTaskForm" class="btn btn-primary" id="saveEditTaskBtn">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(): void {
    const form = document.getElementById('editTaskForm') as HTMLFormElement;
    const modal = document.getElementById('editTaskModal');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(form);
    });

    modal?.addEventListener('hidden.bs.modal', () => {
      form?.reset();
    });
  }

  private async handleSubmit(form: HTMLFormElement): Promise<void> {
    const formData = new FormData(form);
    const updatedTask = {
      ...this.task,
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || '',
      status: formData.get('status') as TaskStatus
    };

    try {
      const savedTask = await this.taskService.updateTask(updatedTask);
      this.onTaskUpdated(savedTask);
      this.hide();
    } catch (err) {
      const errorDiv = document.getElementById('editTaskErrorMessage');
      if (errorDiv) {
        errorDiv.textContent = 'Erro ao salvar tarefa';
        errorDiv.classList.remove('d-none');
      }
    }
  }

  show(): void {
    const modalEl = document.getElementById('editTaskModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  hide(): void {
    const modalEl = document.getElementById('editTaskModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
}
