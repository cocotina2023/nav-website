// db.js
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DB_PATH } from './config.js';

sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolvedDbPath = resolveDbPath(DB_PATH);
const schemaPath = path.resolve(__dirname, 'database/schema.sql');

ensureDirectory(path.dirname(resolvedDbPath));
removeInvalidDatabase(resolvedDbPath);

let resolveReady;
let rejectReady;

export const dbReady = new Promise((resolve, reject) => {
  resolveReady = resolve;
  rejectReady = reject;
});

export const db = new sqlite3.Database(
  resolvedDbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('❌ 数据库连接失败:', err.message);
      rejectReady(err);
      return;
    }

    console.log('✅ 已连接 SQLite 数据库:', resolvedDbPath);

    initializeDatabase()
      .then(() => {
        console.log('✅ 数据库初始化完成');
        resolveReady();
      })
      .catch((error) => {
        console.error('❌ 数据库初始化失败:', error);
        rejectReady(error);
        db.close();
      });
  }
);

export const dbPath = resolvedDbPath;

export const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

export const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }

      resolve(row);
    });
  });

export const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }

      resolve(rows);
    });
  });

export const execAsync = (sql) =>
  new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });

async function initializeDatabase() {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

  await execAsync('PRAGMA foreign_keys = ON;');
  await execAsync(schema);
  console.log('✅ 数据库表结构已初始化');

  await ensureDefaultAdmin();
  await seedDefaultData();
}

function resolveDbPath(dbPath) {
  const normalized = normalizeDbPath(dbPath || './database/nav.db');
  return path.isAbsolute(normalized)
    ? normalized
    : path.resolve(__dirname, normalized);
}

function normalizeDbPath(input) {
  if (!input) {
    return './database/nav.db';
  }

  if (input.startsWith('sqlite://')) {
    return input.replace(/^sqlite:\/\//, '');
  }

  return input;
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('📁 已创建数据库目录:', dir);
  }
}

function removeInvalidDatabase(targetPath) {
  if (!fs.existsSync(targetPath)) {
    console.log('⚠️  Database file not found, will create new database');
    return;
  }

  try {
    const stats = fs.statSync(targetPath);
    if (stats.size === 0) {
      console.warn('⚠️  检测到空数据库文件，重新创建...');
      fs.unlinkSync(targetPath);
      return;
    }

    const snippet = fs.readFileSync(targetPath, { encoding: 'utf8' });
    if (snippet.includes('CREATE TABLE')) {
      console.warn('⚠️  检测到文本形式的数据库文件，重新创建...');
      fs.unlinkSync(targetPath);
    }
  } catch (error) {
    // 若读取失败，认为是有效的二进制数据库文件
  }
}

async function ensureDefaultAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || '123456';

  const existing = await getAsync('SELECT id FROM users WHERE username = ?', [
    adminUsername,
  ]);

  if (!existing) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    await runAsync('INSERT INTO users (username, password) VALUES (?, ?)', [
      adminUsername,
      hashedPassword,
    ]);
    console.log(`✅ 默认管理员用户已创建: ${adminUsername}`);
    console.log(`🔑 默认密码: ${adminPassword}`);
    console.warn('⚠️  请在首次登录后修改密码!');
  } else {
    console.log('✅ 管理员用户已存在');
  }
}

async function seedDefaultData() {
  const menuCountRow = await getAsync('SELECT COUNT(*) AS count FROM menus');
  const menuCount = menuCountRow ? menuCountRow.count : 0;

  if (menuCount > 0) {
    return;
  }

  const defaultMenus = [
    { name: '常用推荐', icon: 'i-carbon-star', order_index: 0 },
  ];

  const insertedMenus = [];

  for (const menu of defaultMenus) {
    const result = await runAsync(
      'INSERT INTO menus (name, icon, order_index) VALUES (?, ?, ?)',
      [menu.name, menu.icon ?? null, menu.order_index ?? 0]
    );
    insertedMenus.push({ ...menu, id: result.lastID });
  }

  if (insertedMenus.length > 0) {
    const defaultCards = [
      {
        title: 'Nav Website 管理后台',
        url: '/admin',
        icon: 'i-carbon-dashboard',
        menuId: insertedMenus[0].id,
      },
    ];

    for (const card of defaultCards) {
      await runAsync(
        'INSERT INTO cards (title, url, icon, menu_id) VALUES (?, ?, ?, ?)',
        [card.title, card.url, card.icon ?? null, card.menuId]
      );
    }
  }

  console.log('✅ 默认菜单与示例数据已创建');
}
