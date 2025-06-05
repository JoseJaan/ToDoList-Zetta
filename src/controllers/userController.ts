import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { UserValidation } from '../utils/userValidation';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validation = UserValidation.validateCreateUser(req.body);
      
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validation.errors
        });
        return;
      }

      const user = await this.userService.createUser(req.body);

      const { password, ...userWithoutPassword } = user.toJSON();

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: userWithoutPassword
      });
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);

      if (error.message.includes('Email já está em uso')) {
        res.status(409).json({
          error: 'Conflito',
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
        message: 'Erro ao criar usuário'
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();

      res.status(200).json({
        message: 'Usuários encontrados com sucesso',
        users: users,
        total: users.length
      });
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar usuários'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idValidation = UserValidation.validateUserId(id);
      
      if (!idValidation.isValid) {
        res.status(400).json({
          error: 'ID inválido',
          message: idValidation.error
        });
        return;
      }

      const user = await this.userService.getUserById(id);

      res.status(200).json({
        message: 'Usuário encontrado com sucesso',
        user: user
      });
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);

      if (error.message === 'Usuário não encontrado') {
        res.status(404).json({
          error: 'Não encontrado',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar usuário'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idValidation = UserValidation.validateUserId(id);
      
      if (!idValidation.isValid) {
        res.status(400).json({
          error: 'ID inválido',
          message: idValidation.error
        });
        return;
      }

      const validation = UserValidation.validateUpdateUser(req.body);
      
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validation.errors
        });
        return;
      }

      const user = await this.userService.updateUser(id, req.body);

      res.status(200).json({
        message: 'Usuário atualizado com sucesso',
        user: user
      });
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);

      if (error.message === 'Usuário não encontrado') {
        res.status(404).json({
          error: 'Não encontrado',
          message: error.message
        });
        return;
      }

      if (error.message.includes('Email já está em uso')) {
        res.status(409).json({
          error: 'Conflito',
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
        message: 'Erro ao atualizar usuário'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idValidation = UserValidation.validateUserId(id);
      
      if (!idValidation.isValid) {
        res.status(400).json({
          error: 'ID inválido',
          message: idValidation.error
        });
        return;
      }

      await this.userService.deleteUser(id);

      res.status(200).json({
        message: 'Usuário excluído com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);

      if (error.message === 'Usuário não encontrado') {
        res.status(404).json({
          error: 'Não encontrado',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao excluir usuário'
      });
    }
  }
}