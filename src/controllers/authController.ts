import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthValidation } from '../utils/authValidation';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validation = AuthValidation.validateLogin(req.body);
     
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validation.errors
        });
        return;
      }

      const result = await this.authService.login(req.body);
      
      res.cookie('authToken', result.token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, //24 horas em millisegundos
      });

      res.status(200).json({
        message: 'Login realizado com sucesso',
        user: result.user
      });
    } catch (error: any) {
      if (error.message === 'Credenciais inválidas') {
        res.status(401).json({
          error: 'Não autorizado',
          message: error.message
        });
        return;
      }
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao fazer login'
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao fazer logout'
      });
    }
  }

  //Obtém dados do usuário autenticado
  async me(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      res.status(200).json({
        message: 'Dados do usuário obtidos com sucesso',
        user: user
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao obter dados do usuário'
      });
    }
  }
}