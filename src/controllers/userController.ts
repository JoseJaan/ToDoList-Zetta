import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { UserValidation } from '../utils/userValidation';
import { CloudinaryService } from '../services/cloudinaryService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log("[userController.create]: Chegou no controller")
      const validation = UserValidation.validateCreateUser(req.body);
      console.log("[userController.create]: Dados: ",req.body)
      if (!validation.isValid) {
        console.log("[userController.create]: Dados inválidos", validation.errors)
        res.status(400).json({
          error: 'Dados inválidos',
          details: validation.errors
        });
        return;
      }
      console.log("[userController.create]: Dados são válidos")
      let imageUrl: string | undefined = undefined;
    
      if (req.file) {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
          res.status(400).json({
            error: 'Tipo de arquivo inválido',
            message: 'Apenas imagens JPEG, PNG, GIF e WebP são permitidas'
          });
          return;
        }

        const maxSize = 5 * 1024 * 1024; 
        if (req.file.size > maxSize) {
          res.status(400).json({
            error: 'Arquivo muito grande',
            message: 'A imagem deve ter no máximo 5MB'
          });
          return;
        }

        imageUrl = await CloudinaryService.uploadImage(
          req.file.buffer,
          `user-${Date.now()}`,
          'profile-images'
        );
      }

      const user = await this.userService.createUser({
        ...req.body,
        profileImage: imageUrl
      });

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

  async uploadProfileImage(req: Request, res: Response): Promise<void> {
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

      if (!req.file) {
        res.status(400).json({
          error: 'Arquivo obrigatório',
          message: 'Nenhuma imagem foi enviada'
        });
        return;
      }

      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        res.status(400).json({
          error: 'Tipo de arquivo inválido',
          message: 'Apenas imagens JPEG, PNG, GIF e WebP são permitidas'
        });
        return;
      }

      //Valida tamanho do arquivo (máximo de 5MB)
      const maxSize = 5 * 1024 * 1024; 
      if (req.file.size > maxSize) {
        res.status(400).json({
          error: 'Arquivo muito grande',
          message: 'A imagem deve ter no máximo 5MB'
        });
        return;
      }

      const imageUrl = await CloudinaryService.uploadImage(
        req.file.buffer,
        `user-${id}-${Date.now()}`,
        'profile-images'
      );

      const user = await this.userService.updateUserProfileImage(id, imageUrl);

      res.status(200).json({
        message: 'Imagem de perfil atualizada com sucesso',
        user: user,
        imageUrl: imageUrl
      });

    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);

      if (error.message === 'Usuário não encontrado') {
        res.status(404).json({
          error: 'Não encontrado',
          message: error.message
        });
        return;
      }

      if (error.message.includes('Erro ao fazer upload da imagem')) {
        res.status(500).json({
          error: 'Erro no upload',
          message: 'Erro ao processar a imagem no Cloudinary'
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao atualizar imagem de perfil'
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