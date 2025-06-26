import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthValidation } from '../utils/authValidation';
import { User, PasswordReset } from '../models';
import emailService from '../services/emailService';

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
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
        maxAge: 24 * 60 * 60 * 1000, // 24 horas em millisegundos
        path: '/', 
      });
      console.log("[login] result.user: ",result.user)
      res.status(200).json({
        message: 'Login realizado com sucesso',
        user: result.user,
        token: result.token
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

  async checkAuth(req: Request, res: Response): Promise<void> {
    try {
      if (req.user) {
        res.status(200).json({
          authenticated: true,
          user: req.user
        });
      } else {
        res.status(401).json({
          authenticated: false,
          message: 'Não autenticado'
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao verificar autenticação'
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
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

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ 
          error: 'Dados inválidos',
          message: 'Email é obrigatório' 
        });
        return;
      }

      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        res.status(200).json({
          message: 'Se o email existir em nossa base, você receberá as instruções para redefinir sua senha.'
        });
        return;
      }

      await PasswordReset.update(
        { used: true },
        { where: { userId: user.id, used: false } }
      );

      const token = PasswordReset.generateToken();
      const expiresAt = PasswordReset.getExpirationTime();

      await PasswordReset.create({
        userId: user.id,
        token,
        expiresAt,
      });

      await emailService.sendPasswordResetEmail(user.email, token, user.name);

      res.status(200).json({
        message: 'Se o email existir em nossa base, você receberá as instruções para redefinir sua senha.'
      });

    } catch (error: any) {
      console.error('Erro em forgotPassword:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao processar solicitação de redefinição'
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          error: 'Dados inválidos',
          message: 'Token e nova senha são obrigatórios'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          error: 'Dados inválidos',
          message: 'A nova senha deve ter pelo menos 6 caracteres'
        });
        return;
      }

      const passwordReset = await PasswordReset.findOne({
        where: { token, used: false }
      });

      if (!passwordReset) {
        res.status(400).json({
          error: 'Token inválido',
          message: 'Token inválido ou já utilizado'
        });
        return;
      }

      if (passwordReset.isExpired()) {
        res.status(400).json({
          error: 'Token expirado',
          message: 'Token expirado. Solicite uma nova redefinição de senha'
        });
        return;
      }

      const user = await User.findByPk(passwordReset.userId);
      if (!user) {
        res.status(400).json({
          error: 'Usuário não encontrado',
          message: 'Usuário associado ao token não encontrado'
        });
        return;
      }
      user.password = newPassword;
      await user.save();

      passwordReset.used = true;
      await passwordReset.save();

      res.status(200).json({
        message: 'Senha redefinida com sucesso'
      });

    } catch (error: any) {
      console.error('Erro em resetPassword:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao redefinir senha'
      });
    }
  }

  async validateResetToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({
          error: 'Dados inválidos',
          message: 'Token é obrigatório'
        });
        return;
      }

      const passwordReset = await PasswordReset.findOne({
        where: { token, used: false }
      });

      if (!passwordReset) {
        res.status(400).json({
          error: 'Token inválido',
          message: 'Token inválido ou já utilizado'
        });
        return;
      }

      if (passwordReset.isExpired()) {
        res.status(400).json({
          error: 'Token expirado',
          message: 'Token expirado'
        });
        return;
      }

      res.status(200).json({
        message: 'Token válido'
      });

    } catch (error: any) {
      console.error('Erro em validateResetToken:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao validar token'
      });
    }
  }
}