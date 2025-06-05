import { User } from '../models';
import { CreateUserRequest, UpdateUserRequest } from '../utils/userValidation';

export class UserService {
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const user = await User.create({
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password
      });

      return user;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email já está em uso');
      }
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err: any) => err.message);
        throw new Error(`Erro de validação: ${validationErrors.join(', ')}`);
      }
      throw new Error('Erro interno do servidor ao criar usuário');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });

      return users;
    } catch (error) {
      throw new Error('Erro interno do servidor ao buscar usuários');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return user;
    } catch (error: any) {
      if (error.message === 'Usuário não encontrado') {
        throw error;
      }
      throw new Error('Erro interno do servidor ao buscar usuário');
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const updateData: any = {};
      
      if (userData.name) {
        updateData.name = userData.name.trim();
      }
      
      if (userData.email) {
        updateData.email = userData.email.toLowerCase().trim();
      }
      
      if (userData.password) {
        updateData.password = userData.password;
      }

      await user.update(updateData);

      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      return updatedUser!;
    } catch (error: any) {
      if (error.message === 'Usuário não encontrado') {
        throw error;
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email já está em uso');
      }
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err: any) => err.message);
        throw new Error(`Erro de validação: ${validationErrors.join(', ')}`);
      }
      throw new Error('Erro interno do servidor ao atualizar usuário');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      await user.destroy();
    } catch (error: any) {
      if (error.message === 'Usuário não encontrado') {
        throw error;
      }
      throw new Error('Erro interno do servidor ao excluir usuário');
    }
  }
}