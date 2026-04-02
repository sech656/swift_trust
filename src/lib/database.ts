import { Sequelize } from 'sequelize';
import sqlite3 from 'sqlite3';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: sqlite3,
  storage: './database.sqlite',
  logging: false,
});

export default sequelize;
