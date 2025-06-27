import { Task, CreateTaskData, UpdateTaskData } from '../types/Task';
import { AuthService } from './AuthService';

export class TaskService {
  private static instance: TaskService;
  private baseUrl = '/api/tasks';
  private authService: AuthService;

  constructor() {
    this.authService = AuthService.getInstance();
  }

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  async getTasks(): Promise<Task[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar tarefas');
      }

      const data = await response.json();
      return data.tasks.map((task: Task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        expanded: false
      }));
    } catch (error) {
      throw error;
    }
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authService.getToken()}`
        },
        body: JSON.stringify(taskData)
      });
      console.log("[createTask] response: ",response)
      if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      const responseData = await response.json();
      const task = responseData.task;
      return {
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        expanded: false
      };
    } catch (error) {
      throw error;
    }
  }

  async updateTask(taskData: UpdateTaskData): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/${taskData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authService.getToken()}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar tarefa');
      }

      const task = await response.json();
      return {
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir tarefa');
      }
    } catch (error) {
      throw error;
    }
  }
}