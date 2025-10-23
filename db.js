// db.js
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { DB_PATH } from './config.js';

sqlite3.verbose();

// Check if database file exists and is valid
const dbExists = fs.existsSync(DB_PATH);
if (!dbExists) {
  console.log('⚠️  Database file not found, will create new database');
} else {
  try {
    // Check if file is actually SQL text instead of binary database
    const content = fs.readFileSync(DB_PATH, 'utf8');
    if (content.includes('CREATE TABLE')) {
      console.log('⚠️  Invalid database file detected (text schema), removing...');
      fs.unlinkSync(DB_PATH);
    }
  } catch (err) {
    // Binary file, likely a valid database
  }
}

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1);
  } else {
    console.log('✅ 已连接 SQLite 数据库:', DB_PATH);
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Read and execute schema
  const schemaPath = './database/schema.sql';
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    return;
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  db.exec(schema, (err) => {
    if (err) {
      console.error('❌ 数据库初始化失败:', err.message);
      return;
    }
    console.log('✅ 数据库表结构已初始化');
    
    // Create default admin user if not exists
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';
    
    db.get('SELECT * FROM users WHERE username = ?', [adminUsername], (err, row) => {
      if (err) {
        console.error('❌ 检查管理员用户失败:', err.message);
        return;
      }
      
      if (!row) {
        const hashedPassword = bcrypt.hashSync(adminPassword, 10);
        db.run(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          [adminUsername, hashedPassword],
          function (err) {
            if (err) {
              console.error('❌ 创建管理员用户失败:', err.message);
            } else {
              console.log(`✅ 默认管理员用户已创建: ${adminUsername}`);
              console.log(`🔑 默认密码: ${adminPassword}`);
              console.log('⚠️  请在首次登录后修改密码!');
            }
          }
        );
      } else {
        console.log('✅ 管理员用户已存在');
      }
    });
  });
}
