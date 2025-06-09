export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  profileImage?: string;
}

export class UserValidation {
  static validateCreateUser(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name) {
      errors.push('Nome é obrigatório');
    }
    
    if (!data.email) {
      errors.push('Email é obrigatório');
    }
    
    if (!data.password) {
      errors.push('Senha é obrigatória');
    }

    if (data.name && (typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 100)) {
      errors.push('Nome deve ter entre 2 e 100 caracteres');
    }

    if (data.email && (typeof data.email !== 'string' || !this.isValidEmail(data.email))) {
      errors.push('Email deve ter um formato válido');
    }

    if (data.password && (typeof data.password !== 'string' || data.password.length < 6)) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (data.profileImage && (typeof data.profileImage !== 'string' || !this.isValidUrl(data.profileImage))) {
      errors.push('URL da imagem de perfil deve ser válida');
    }

    const allowedFields = ['name', 'email', 'password', 'profileImage'];
    const extraFields = Object.keys(data).filter(key => !allowedFields.includes(key));
    if (extraFields.length > 0) {
      errors.push(`Campos não permitidos: ${extraFields.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdateUser(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name && !data.email && !data.password && !data.profileImage) {
      errors.push('Pelo menos um campo deve ser fornecido para atualização');
    }

    if (data.name && (typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 100)) {
      errors.push('Nome deve ter entre 2 e 100 caracteres');
    }

    if (data.email && (typeof data.email !== 'string' || !this.isValidEmail(data.email))) {
      errors.push('Email deve ter um formato válido');
    }

    if (data.password && (typeof data.password !== 'string' || data.password.length < 6)) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (data.profileImage && (typeof data.profileImage !== 'string' || !this.isValidUrl(data.profileImage))) {
      errors.push('URL da imagem de perfil deve ser válida');
    }

    const allowedFields = ['name', 'email', 'password', 'profileImage'];
    const extraFields = Object.keys(data).filter(key => !allowedFields.includes(key));
    if (extraFields.length > 0) {
      errors.push(`Campos não permitidos: ${extraFields.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUserId(id: string): { isValid: boolean; error?: string } {
    if (!id) {
      return { isValid: false, error: 'ID do usuário é obrigatório' };
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { isValid: false, error: 'ID do usuário deve ter um formato válido' };
    }

    return { isValid: true };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}