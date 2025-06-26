import { sign, SignOptions, verify, JwtPayload as JwtPayloadType, VerifyOptions } from 'jsonwebtoken';
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
    this.jwtSecret = process.env.JWT_SECRET || 'secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

    if (!process.env.JWT_SECRET) {
      console.warn("[AuthService Constructor] WARNING: JWT_SECRET not found in environment variables, using fallback");
    }
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

      const token = sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn
      } as SignOptions);

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
    const tokenParts = token.split('.');
    console.log("[verifyToken] token parts count: ", tokenParts.length);
    
    if (tokenParts.length !== 3) {
      throw new Error('Token malformado');
    }
    const decoded = verify(token, this.jwtSecret) as JwtPayloadType;
    return decoded as JwtPayload;
  } catch (error: any) {
    console.log("[verifyToken] error details: ", {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      console.log("[verifyToken] JsonWebTokenError details: ", error.message);
      throw new Error('Token inválido');
    }
    throw new Error('Erro ao verificar token');
  }
}

  async getUserFromToken(token: string): Promise<User> {
    try {
      console.log("[getUserFromToken] token: ",token)
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