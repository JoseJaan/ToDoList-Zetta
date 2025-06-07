import { TaskStatus } from '../models/Task';

export interface CreateTaskRequest {
  name: string;
  description: string;
  status?: TaskStatus;
  userId: string;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  status?: TaskStatus;
}

export class TaskValidation {
  static validateCreateTask(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name) {
      errors.push('Nome da tarefa é obrigatório');
    }

    if (!data.description) {
      errors.push('Descrição é obrigatória');
    }

    if (!data.userId) {
      errors.push('ID do usuário é obrigatório');
    }

    if (data.name && (typeof data.name !== 'string' || data.name.trim().length < 1 || data.name.trim().length > 200)) {
      errors.push('Nome deve ter entre 1 e 200 caracteres');
    }

    if (data.description && (typeof data.description !== 'string' || data.description.trim().length < 1 || data.description.trim().length > 1000)) {
      errors.push('Descrição deve ter entre 1 e 1000 caracteres');
    }

    if (data.status && !Object.values(TaskStatus).includes(data.status)) {
      errors.push('Status deve ser "pendente" ou "concluida"');
    }

    if (data.userId && !this.isValidUUID(data.userId)) {
      errors.push('ID do usuário deve ter um formato válido');
    }

    const allowedFields = ['name', 'description', 'status', 'userId'];
    const extraFields = Object.keys(data).filter(key => !allowedFields.includes(key));
    if (extraFields.length > 0) {
      errors.push(`Campos não permitidos: ${extraFields.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdateTask(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name && !data.description && !data.status) {
      errors.push('Pelo menos um campo deve ser fornecido para atualização');
    }

    if (data.name && (typeof data.name !== 'string' || data.name.trim().length < 1 || data.name.trim().length > 200)) {
      errors.push('Nome deve ter entre 1 e 200 caracteres');
    }

    if (data.description && (typeof data.description !== 'string' || data.description.trim().length < 1 || data.description.trim().length > 1000)) {
      errors.push('Descrição deve ter entre 1 e 1000 caracteres');
    }

    if (data.status && !Object.values(TaskStatus).includes(data.status)) {
      errors.push('Status deve ser "pendente" ou "concluida"');
    }

    if (data.userId !== undefined) {
      errors.push('Não é possível alterar o usuário responsável pela tarefa');
    }

    const allowedFields = ['name', 'description', 'status'];
    const extraFields = Object.keys(data).filter(key => !allowedFields.includes(key));
    if (extraFields.length > 0) {
      errors.push(`Campos não permitidos: ${extraFields.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateTaskId(id: string): { isValid: boolean; error?: string } {
    if (!id) {
      return { isValid: false, error: 'ID da tarefa é obrigatório' };
    }

    const taskId = parseInt(id, 10);
    if (isNaN(taskId) || taskId <= 0) {
      return { isValid: false, error: 'ID da tarefa deve ser um número válido' };
    }

    return { isValid: true };
  }

  static validateUserId(id: string): { isValid: boolean; error?: string } {
    if (!id) {
      return { isValid: false, error: 'ID do usuário é obrigatório' };
    }

    if (!this.isValidUUID(id)) {
      return { isValid: false, error: 'ID do usuário deve ter um formato válido' };
    }

    return { isValid: true };
  }

  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}