import jwt from 'jsonwebtoken';
import { User } from '../models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  async login(loginData: LoginRequest): Promise<{ user: User; token: string }> {
    try {
      const { email, password } = loginData;

      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() }
      });

      if (!user) {
        throw new Error('Credenciais inválidas');
      }

      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
      }

      const payload: JwtPayload = {
        userId: user.id,
        email: user.email
      };

      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn
      });

      const { password: _, ...userWithoutPassword } = user.toJSON();

      return {
        user: userWithoutPassword as User,
        token
      };
    } catch (error: any) {
      if (error.message === 'Credenciais inválidas') {
        throw error;
      }
      throw new Error('Erro interno do servidor ao fazer login');
    }
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      }
      throw new Error('Erro ao verificar token');
    }
  }

  async getUserFromToken(token: string): Promise<User> {
    try {
      const payload = this.verifyToken(token);
      
      const user = await User.findByPk(payload.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return user;
    } catch (error: any) {
      throw error;
    }
  }
}