import { Sequelize } from 'sequelize';
import pg from 'pg';
import sqlite3 from 'sqlite3';

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';
const isPostgres = databaseUrl.startsWith('postgres');

const sequelize = new Sequelize(databaseUrl, {
  dialect: isPostgres ? 'postgres' : 'sqlite',
  dialectModule: isPostgres ? pg : sqlite3,
  logging: false,
  dialectOptions: isPostgres ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  } : {},
});

export default sequelize;
