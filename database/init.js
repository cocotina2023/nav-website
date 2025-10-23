// database/init.js - Database initialization script
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const rawDbPath = process.env.DB_PATH || process.env.DATABASE_URL || './database/nav.db';
const resolvedDbPath = resolveDbPath(rawDbPath);
const schemaPath = path.join(__dirname, 'schema.sql');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

let db;

(async () => {
  console.log('🔧 Initializing database...');

  try {
    ensureDirectory(path.dirname(resolvedDbPath));
    removeInvalidDatabase(resolvedDbPath);
    await openDatabase();

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    await execAsync('PRAGMA foreign_keys = ON;');
    await execAsync(schema);
    console.log('✅ Database schema created');

    await ensureDefaultAdmin();
    await seedDefaultData();

    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    if (db) {
      try {
        await closeDatabase();
      } catch (error) {
        console.error('⚠️  Failed to close database connection:', error.message || error);
        process.exitCode = process.exitCode || 1;
      }
    }
  }
})();

function resolveDbPath(target) {
  const normalized = normalizeDbPath(target);
  return path.isAbsolute(normalized)
    ? normalized
    : path.resolve(projectRoot, normalized);
}

function normalizeDbPath(value) {
  if (!value) {
    return './database/nav.db';
  }

  if (value.startsWith('sqlite://')) {
    return value.replace(/^sqlite:\/\//, '');
  }

  return value;
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('📁 Created database directory:', dir);
  }
}

function removeInvalidDatabase(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  try {
    const stats = fs.statSync(targetPath);
    if (stats.size === 0) {
      console.warn('⚠️  Found empty database file, removing...');
      fs.unlinkSync(targetPath);
      return;
    }

    const snippet = fs.readFileSync(targetPath, { encoding: 'utf8' });
    if (snippet.includes('CREATE TABLE')) {
      console.warn('⚠️  Found textual schema file, removing...');
      fs.unlinkSync(targetPath);
    }
  } catch (error) {
    // Assume valid binary database when reading fails
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(
      resolvedDbPath,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) {
          return reject(err);
        }

        console.log('✅ Connected to SQLite database:', resolvedDbPath);
        resolve();
      }
    );
  });
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function execAsync(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }

      resolve(row);
    });
  });
}

async function ensureDefaultAdmin() {
  const existing = await getAsync('SELECT id FROM users WHERE username = ?', [
    ADMIN_USERNAME,
  ]);

  if (existing) {
    console.log(`✅ Admin user already exists: ${ADMIN_USERNAME}`);
    return;
  }

  const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  await runAsync('INSERT INTO users (username, password) VALUES (?, ?)', [
    ADMIN_USERNAME,
    hashedPassword,
  ]);

  console.log(`✅ Admin user created: ${ADMIN_USERNAME}`);
  console.log(`🔑 Default password: ${ADMIN_PASSWORD}`);
  console.warn('⚠️  Please change the password after first login!');
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

  console.log('✅ Seeded default menus and sample data');
}
