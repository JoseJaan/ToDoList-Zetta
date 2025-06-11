import { UserService } from '../../src/services/userService';
import { User } from '../../src/models';

jest.mock('../../src/models', () => ({
  User: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed_password',
  toJSON: () => ({ id: '1', name: 'John Doe', email: 'john@example.com' }),
};

describe('UserService', () => {
  const userService = new UserService();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('deve criar um usuário com sucesso', async () => {
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.createUser({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret',
        profileImage: ''
      });

      expect(User.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('deve lançar erro se o email já existir', async () => {
      const error = new Error();
      (error as any).name = 'SequelizeUniqueConstraintError';
      (User.create as jest.Mock).mockRejectedValue(error);

      await expect(userService.createUser({
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'secret',
        profileImage: ''
      })).rejects.toThrow('Email já está em uso');
    });
  });

  describe('getUserById', () => {
    it('deve retornar usuário se existir', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      const user = await userService.getUserById('1');
      expect(user).toEqual(mockUser);
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(userService.getUserById('999')).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('getAllUsers', () => {
    it('deve retornar lista de usuários', async () => {
      (User.findAll as jest.Mock).mockResolvedValue([mockUser]);
      const result = await userService.getAllUsers();
      expect(result).toHaveLength(1);
    });
  });

  describe('deleteUser', () => {
    it('deve excluir o usuário com sucesso', async () => {
      const destroyMock = jest.fn();
      (User.findByPk as jest.Mock).mockResolvedValue({ ...mockUser, destroy: destroyMock });

      await userService.deleteUser('1');
      expect(destroyMock).toHaveBeenCalled();
    });

    it('deve lançar erro se usuário não existir', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(userService.deleteUser('563')).rejects.toThrow('Usuário não encontrado');
    });
  });
});
