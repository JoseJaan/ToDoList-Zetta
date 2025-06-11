import { TaskService } from '../../src/services/taskService';
import { Task, User, TaskStatus } from '../../src/models';

jest.mock('../../src/models', () => ({
  Task: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn()
  },
  User: {},
  TaskStatus: {
    PENDING: 'pendente',
    COMPLETED: 'concluida'
  }
}));

describe('TaskService', () => {
  const service = new TaskService();
  const mockTask = {
    id: 'task-id',
    name: 'Tarefa Teste',
    description: 'Descrição',
    status: TaskStatus.PENDING,
    userId: 'user-id',
    destroy: jest.fn(),
    update: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('deve criar uma tarefa com sucesso', async () => {
      (Task.create as jest.Mock).mockResolvedValue({ id: 'task-id' });
      (Task.findByPk as jest.Mock).mockResolvedValue(mockTask);

      const result = await service.createTask({
        name: 'Tarefa Teste',
        description: 'Descrição',
        userId: 'user-id',
        status: TaskStatus.PENDING
      });

      expect(Task.create).toHaveBeenCalled();
      expect(Task.findByPk).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('deve lançar erro de validação', async () => {
      const error = new Error();
      (error as any).name = 'SequelizeValidationError';
      (error as any).errors = [{ message: 'Nome inválido' }];
      (Task.create as jest.Mock).mockRejectedValue(error);

      await expect(service.createTask({
        name: '',
        description: '',
        userId: 'user-id',
        status: TaskStatus.PENDING
      })).rejects.toThrow(/Erro de validação/);
    });
  });

  describe('getAllTasks', () => {
    it('deve retornar todas as tarefas do usuário', async () => {
      (Task.findAll as jest.Mock).mockResolvedValue([mockTask]);

      const result = await service.getAllTasks('user-id');
      expect(result).toEqual([mockTask]);
    });
  });

  describe('getTaskById', () => {
    it('deve retornar a tarefa se for do usuário', async () => {
      (Task.findOne as jest.Mock).mockResolvedValue(mockTask);

      const task = await service.getTaskById('task-id', 'user-id');
      expect(task).toEqual(mockTask);
    });

    it('deve lançar "Acesso negado" se a tarefa for de outro usuário', async () => {
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByPk as jest.Mock).mockResolvedValue(mockTask);

      await expect(service.getTaskById('task-id', 'outro-user')).rejects.toThrow('Acesso negado');
    });

    it('deve lançar "Tarefa não encontrada" se não existir', async () => {
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.getTaskById('task-id', 'user-id')).rejects.toThrow('Tarefa não encontrada');
    });
  });

  describe('updateTask', () => {
    it('deve atualizar tarefa com sucesso', async () => {
      (Task.findOne as jest.Mock).mockResolvedValue(mockTask);
      (Task.findByPk as jest.Mock).mockResolvedValue(mockTask);

      const result = await service.updateTask('task-id', { name: 'Nova Tarefa' }, 'user-id');

      expect(mockTask.update).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('deve lançar erro se não encontrar tarefa', async () => {
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.updateTask('task-id', {}, 'user-id')).rejects.toThrow('Tarefa não encontrada');
    });

    it('deve lançar erro se for de outro usuário', async () => {
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByPk as jest.Mock).mockResolvedValue(mockTask);

      await expect(service.updateTask('task-id', {}, 'outro-user')).rejects.toThrow('Acesso negado');
    });
  });

  describe('deleteTask', () => {
    it('deve deletar tarefa com sucesso', async () => {
      (Task.findOne as jest.Mock).mockResolvedValue(mockTask);

      await service.deleteTask('task-id', 'user-id');
      expect(mockTask.destroy).toHaveBeenCalled();
    });

    it('deve lançar "Tarefa não encontrada"', async () => {
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteTask('task-id', 'user-id')).rejects.toThrow('Tarefa não encontrada');
    });

    it('deve lançar "Acesso negado" se for de outro usuário', async () => {
      (Task.findOne as jest.Mock).mockResolvedValue(null);
      (Task.findByPk as jest.Mock).mockResolvedValue(mockTask);

      await expect(service.deleteTask('task-id', 'outro-user')).rejects.toThrow('Acesso negado');
    });
  });
});
