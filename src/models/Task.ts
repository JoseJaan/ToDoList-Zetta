import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum TaskStatus {
  PENDING = 'pendente',
  COMPLETED = 'concluida'
}

interface TaskAttributes {
  id: number;
  name: string;
  description: string;
  status: TaskStatus;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public status!: TaskStatus;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome da tarefa é obrigatório'
        },
        len: {
          args: [1, 200],
          msg: 'Nome deve ter entre 1 e 200 caracteres'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Descrição é obrigatória'
        },
        len: {
          args: [1, 1000],
          msg: 'Descrição deve ter entre 1 e 1000 caracteres'
        }
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TaskStatus)),
      allowNull: false,
      defaultValue: TaskStatus.PENDING,
      validate: {
        isIn: {
          args: [Object.values(TaskStatus)],
          msg: 'Status deve ser "pendente" ou "concluida"'
        }
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    timestamps: true
  }
);

export default Task;