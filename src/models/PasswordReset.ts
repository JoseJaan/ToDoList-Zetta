import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import crypto from 'crypto';

interface PasswordResetAttributes {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PasswordResetCreationAttributes extends Optional<PasswordResetAttributes, 'id' | 'used'> {}

class PasswordReset extends Model<PasswordResetAttributes, PasswordResetCreationAttributes> 
  implements PasswordResetAttributes {
  public id!: string;
  public userId!: string;
  public token!: string;
  public expiresAt!: Date;
  public used!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public static getExpirationTime(): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1); // Token válido por 1 hora
    return expiration;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

PasswordReset.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'PasswordReset',
    tableName: 'password_resets',
    timestamps: true,
  }
);

export default PasswordReset;