import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import crypto from 'crypto';
import moment from 'moment-timezone';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

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
  public createdAt!: Date;
  public updatedAt!: Date;

  private static getBrazilianTime(): Date {
    return moment.tz(BRAZIL_TIMEZONE).toDate();
  }

  public static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public static getExpirationTime(): Date {
    return moment.tz(BRAZIL_TIMEZONE).add(1, 'hour').toDate();
  }

  public isExpired(): boolean {
    const currentTime = PasswordReset.getBrazilianTime();
    return currentTime > this.expiresAt;
  }

  public getCreatedAtBrazil(): string {
    return moment(this.createdAt).tz(BRAZIL_TIMEZONE).format('DD/MM/YYYY HH:mm:ss');
  }

  public getUpdatedAtBrazil(): string {
    return moment(this.updatedAt).tz(BRAZIL_TIMEZONE).format('DD/MM/YYYY HH:mm:ss');
  }

  public getExpiresAtBrazil(): string {
    return moment(this.expiresAt).tz(BRAZIL_TIMEZONE).format('DD/MM/YYYY HH:mm:ss');
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => moment.tz(BRAZIL_TIMEZONE).toDate(),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => moment.tz(BRAZIL_TIMEZONE).toDate(),
    },
  },
  {
    sequelize,
    modelName: 'PasswordReset',
    tableName: 'password_resets',
    timestamps: true,
    hooks: {
      beforeUpdate: (instance: PasswordReset) => {
        instance.updatedAt = moment.tz(BRAZIL_TIMEZONE).toDate();
      },
      beforeCreate: (instance: PasswordReset) => {
        const brazilTime = moment.tz(BRAZIL_TIMEZONE).toDate();
        instance.createdAt = brazilTime;
        instance.updatedAt = brazilTime;
      },
    }
  }
);

export default PasswordReset;