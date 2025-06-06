import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { TaskValidation } from '../utils/taskValidation';
import { TaskStatus } from '../models';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validation = TaskValidation.validateCreateTask(req.body);
      
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validation.errors
        });
        return;
      }

      const task = await this.taskService.createTask(req.body);

      res.status(201).json({
        message: 'Tarefa criada com sucesso',
        task: task
      });
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);

      if (error.message === 'Usuário não encontrado') {
        res.status(404).json({
          error: 'Não encontrado',
          message: error.message
        });
        return;
      }

      if (error.message.includes('Erro de validação')) {
        res.status(400).json({
          error: 'Dados inválidos',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao criar tarefa'
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { userId, status } = req.query;

      if (userId && typeof userId === 'string') {
        const userIdValidation = TaskValidation.validateUserId(userId);
        if (!userIdValidation.isValid) {
          res.status(400).json({
            error: 'ID do usuário inválido',
            message: userIdValidation.error
          });
          return;
        }
      }

      if (status && !Object.values(TaskStatus).includes(status as TaskStatus)) {
        res.status(400).json({
          error: 'Status inválido',
          message: 'Status deve ser "pendente" ou "concluida"'
        });
        return;
      }

      const tasks = await this.taskService.getAllTasks(
        userId as string, 
        status as TaskStatus
      );

      res.status(200).json({
        message: 'Tarefas encontradas com sucesso',
        tasks: tasks,
        total: tasks.length
      });
    } catch (error: any) {
      console.error('Erro ao buscar tarefas:', error);

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar tarefas'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idValidation = TaskValidation.validateTaskId(id);
      
      if (!idValidation.isValid) {
        res.status(400).json({
          error: 'ID inválido',
          message: idValidation.error
        });
        return;
      }

      const task = await this.taskService.getTaskById(id);

      res.status(200).json({
        message: 'Tarefa encontrada com sucesso',
        task: task
      });
    } catch (error: any) {
      console.error('Erro ao buscar tarefa:', error);

      if (error.message === 'Tarefa não encontrada') {
        res.status(404).json({
          error: 'Não encontrado',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar tarefa'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idValidation = TaskValidation.validateTaskId(id);
      
      if (!idValidation.isValid) {
        res.status(400).json({
          error: 'ID inválido',
          message: idValidation.error
        });
        return;
      }

      const validation = TaskValidation.validateUpdateTask(req.body);
      
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validation.errors
        });
        return;
      }

      const task = await this.taskService.updateTask(id, req.body);

      res.status(200).json({
        message: 'Tarefa atualizada com sucesso',
        task: task
      });
    } catch (error: any) {
      console.error('Erro ao atualizar tarefa:', error);

      if (error.message === 'Tarefa não encontrada') {
        res.status(404).json({
          error: 'Não encontrado',
          message: error.message
        });
        return;
      }

      if (error.message.includes('Erro de validação')) {
        res.status(400).json({
          error: 'Dados inválidos',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao atualizar tarefa'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idValidation = TaskValidation.validateTaskId(id);
      
      if (!idValidation.isValid) {
        res.status(400).json({
          error: 'ID inválido',
          message: idValidation.error
        });
        return;
      }

      await this.taskService.deleteTask(id);

      res.status(200).json({
        message: 'Tarefa excluída com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao excluir tarefa:', error);

      if (error.message === 'Tarefa não encontrada') {
        res.status(404).json({
          error: 'Não encontrado',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao excluir tarefa'
      });
    }
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const userIdValidation = TaskValidation.validateUserId(userId);
      
      if (!userIdValidation.isValid) {
        res.status(400).json({
          error: 'ID do usuário inválido',
          message: userIdValidation.error
        });
        return;
      }

      const tasks = await this.taskService.getTasksByUserId(userId);

      res.status(200).json({
        message: 'Tarefas do usuário encontradas com sucesso',
        tasks: tasks,
        total: tasks.length
      });
    } catch (error: any) {
      console.error('Erro ao buscar tarefas do usuário:', error);

      if (error.message === 'Usuário não encontrado') {
        res.status(404).json({
          error: 'Não encontrado',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar tarefas do usuário'
      });
    }
  }
}