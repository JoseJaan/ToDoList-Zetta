import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'todolistzetta',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    timezone: '-03:00', 
    dialectOptions: {
      timezone: '-03:00', 
    },
    define: {
      timestamps: true,
      underscored: false, 
      freezeTableName: true,
    },
  }
);

export default sequelize;
