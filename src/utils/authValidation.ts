import { LoginRequest } from '../services/authService';

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  error?: string;
}

export class AuthValidation {
  static validateLogin(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.email) {
      errors.push('Email é obrigatório');
    } else if (typeof data.email !== 'string') {
      errors.push('Email deve ser uma string');
    } else if (data.email.trim().length === 0) {
      errors.push('Email não pode estar vazio');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.push('Email deve ter um formato válido');
      }
    }

    if (!data.password) {
      errors.push('Senha é obrigatória');
    } else if (typeof data.password !== 'string') {
      errors.push('Senha deve ser uma string');
    } else if (data.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    const allowedFields = ['email', 'password'];
    const extraFields = Object.keys(data).filter(key => !allowedFields.includes(key));
    if (extraFields.length > 0) {
      errors.push(`Campos não permitidos: ${extraFields.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  static validateAuthorizationHeader(authHeader: string | undefined): ValidationResult {
    if (!authHeader) {
      return {
        isValid: false,
        error: 'Token de autorização é obrigatório'
      };
    }

    if (!authHeader.startsWith('Bearer ')) {
      return {
        isValid: false,
        error: 'Formato do token inválido. Use: Bearer <token>'
      };
    }

    const token = authHeader.substring(7); 

    if (!token || token.trim().length === 0) {
      return {
        isValid: false,
        error: 'Token não pode estar vazio'
      };
    }

    return {
      isValid: true
    };
  }
}