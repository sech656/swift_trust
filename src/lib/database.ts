import { Sequelize } from 'sequelize';
import pg from 'pg';
import sqlite3 from 'sqlite3';


const databaseUrl = process.env.DATABASE_URL_UNPOOLED || 'postgresql://neondb_owner:npg_psC28jGbeYKV@ep-raspy-thunder-aji25l0g-pooler.c-3.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
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
