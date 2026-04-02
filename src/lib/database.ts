import { Sequelize } from 'sequelize';
import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';
const isPostgres = databaseUrl.startsWith('postgres');

const sequelize = new Sequelize(databaseUrl, {
  dialect: isPostgres ? 'postgres' : 'sqlite',
  dialectModule: isPostgres ? pg : undefined,
  logging: false,
  dialectOptions: isPostgres ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  } : {},
});

export default sequelize;
