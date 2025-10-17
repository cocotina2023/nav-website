// db.js
import sqlite3 from 'sqlite3';
import { DB_PATH } from './config.js';

sqlite3.verbose();

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
  } else {
    console.log('✅ 已连接 SQLite 数据库:', DB_PATH);
  }
});
