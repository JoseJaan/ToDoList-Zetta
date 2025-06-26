import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthValidation } from '../utils/authValidation';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token: string | undefined;
      if (req.cookies?.authToken) {
        token = req.cookies.authToken;
      } 
      //Se não houver cookie, verifica o header Authorization
      else if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        const headerValidation = AuthValidation.validateAuthorizationHeader(authHeader);
        if (!headerValidation.isValid) {
          res.status(401).json({
            error: 'Não autorizado',
            message: headerValidation.error
          });
          return;
        }
        //Remove "Bearer "
        token = authHeader.substring(7);
      }
      if (!token) {
        res.status(401).json({
          error: 'Não autorizado',
          message: 'Token de acesso não fornecido'
        });
        return;
      }

      const user = await this.authService.getUserFromToken(token);
      req.user = user;
      next();
    } catch (error: any) {
      console.error('Erro na autenticação:', error);

      if (req.cookies?.authToken) {
        res.clearCookie('authToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }

      if (error.message === 'Token expirado') {
        res.status(401).json({
          error: 'Não autorizado',
          message: 'Token expirado'
        });
        return;
      }
      if (error.message === 'Token inválido') {
        res.status(401).json({
          error: 'Não autorizado',
          message: 'Token inválido'
        });
        return;
      }
      if (error.message === 'Usuário não encontrado') {
        res.status(401).json({
          error: 'Não autorizado',
          message: 'Usuário não encontrado'
        });
        return;
      }
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro na verificação de autenticação'
      });
    }
  };

  optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token: string | undefined;

      if (req.cookies?.authToken) {
        token = req.cookies.authToken;
      } 
      else {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          next();
          return;
        }
        token = authHeader.substring(7);
      }

      if (token && token.trim().length > 0) {
        try {
          const user = await this.authService.getUserFromToken(token);
          req.user = user;
        } catch (error) {
          console.warn('Token inválido em autenticação opcional:', error);
          
          if (req.cookies?.authToken) {
            res.clearCookie('authToken', {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });
          }
        }
      }
      next();
    } catch (error: any) {
      console.error('Erro na autenticação opcional:', error);
      next();
    }
  };
}