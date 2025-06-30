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
      const taskData = { ...req.body, userId: req.user.id };
      const validation = TaskValidation.validateCreateTask(taskData);
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validation.errors
        });
        return;
      }

      const task = await this.taskService.createTask(taskData);
      res.status(201).json({
        message: 'Tarefa criada com sucesso',
        task: task
      });
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);

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
      const { status } = req.query;
      const userId = req.user.id; 

      if (status && !Object.values(TaskStatus).includes(status as TaskStatus)) {
        res.status(400).json({
          error: 'Status inválido',
          message: 'Status deve ser "pendente" ou "concluida"'
        });
        return;
      }

      const tasks = await this.taskService.getAllTasks(userId, status as TaskStatus);

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
      const userId = req.user.id;

      const idValidation = TaskValidation.validateTaskId(id);
      
      if (!idValidation.isValid) {
        res.status(400).json({
          error: 'ID inválido',
          message: idValidation.error
        });
        return;
      }

      const task = await this.taskService.getTaskById(id, userId);

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

      if (error.message === 'Acesso negado') {
        res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para acessar esta tarefa'
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
      const userId = req.user.id;
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

      const task = await this.taskService.updateTask(id, req.body, userId);

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

      if (error.message === 'Acesso negado') {
        res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para atualizar esta tarefa'
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
      const userId = req.user.id;

      const idValidation = TaskValidation.validateTaskId(id);
      
      if (!idValidation.isValid) {
        res.status(400).json({
          error: 'ID inválido',
          message: idValidation.error
        });
        return;
      }

      await this.taskService.deleteTask(id, userId);

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

      if (error.message === 'Acesso negado') {
        res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para excluir esta tarefa'
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao excluir tarefa'
      });
    }
  }
}