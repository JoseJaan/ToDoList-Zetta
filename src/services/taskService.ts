import { Task, User, TaskStatus } from '../models';
import { CreateTaskRequest, UpdateTaskRequest } from '../utils/taskValidation';

export class TaskService {
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    try {
      const user = await User.findByPk(taskData.userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const task = await Task.create({
        name: taskData.name.trim(),
        description: taskData.description.trim(),
        status: taskData.status || TaskStatus.PENDING,
        userId: taskData.userId
      });

      return task;
    } catch (error: any) {
      if (error.message === 'Usuário não encontrado') {
        throw error;
      }
      
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err: any) => err.message);
        throw new Error(`Erro de validação: ${validationErrors.join(', ')}`);
      }
      
      throw new Error('Erro interno do servidor ao criar tarefa');
    }
  }

  async getAllTasks(userId?: string, status?: TaskStatus): Promise<Task[]> {
    try {
      const whereConditions: any = {};
      
      if (userId) {
        whereConditions.userId = userId;
      }
      
      if (status) {
        whereConditions.status = status;
      }

      const tasks = await Task.findAll({
        where: whereConditions,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return tasks;
    } catch (error) {
      throw new Error('Erro interno do servidor ao buscar tarefas');
    }
  }

  async getTaskById(id: string): Promise<Task> {
    try {
      const task = await Task.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      return task;
    } catch (error: any) {
      if (error.message === 'Tarefa não encontrada') {
        throw error;
      }
      throw new Error('Erro interno do servidor ao buscar tarefa');
    }
  }

  async updateTask(id: string, taskData: UpdateTaskRequest): Promise<Task> {
    try {
      const task = await Task.findByPk(id);
      
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      const updateData: any = {};
      
      if (taskData.name) {
        updateData.name = taskData.name.trim();
      }
      
      if (taskData.description) {
        updateData.description = taskData.description.trim();
      }
      
      if (taskData.status) {
        updateData.status = taskData.status;
      }

      await task.update(updateData);

      const updatedTask = await Task.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return updatedTask!;
    } catch (error: any) {
      if (error.message === 'Tarefa não encontrada') {
        throw error;
      }
      
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err: any) => err.message);
        throw new Error(`Erro de validação: ${validationErrors.join(', ')}`);
      }
      
      throw new Error('Erro interno do servidor ao atualizar tarefa');
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const task = await Task.findByPk(id);
      
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      await task.destroy();
    } catch (error: any) {
      if (error.message === 'Tarefa não encontrada') {
        throw error;
      }
      throw new Error('Erro interno do servidor ao excluir tarefa');
    }
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const tasks = await Task.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      return tasks;
    } catch (error: any) {
      if (error.message === 'Usuário não encontrado') {
        throw error;
      }
      throw new Error('Erro interno do servidor ao buscar tarefas do usuário');
    }
  }
}