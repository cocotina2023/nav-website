// db.js
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DB_PATH } from './config.js';

sqlite3.verbose();

const REQUIRED_TABLES = ['users', 'menus', 'cards', 'ads', 'friend_links'];
const DEFAULT_SCHEMA = `PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  menu_id INTEGER,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image TEXT NOT NULL,
  link TEXT
);

CREATE TABLE IF NOT EXISTS friend_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  logo TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_menus_order_index ON menus(order_index);
CREATE INDEX IF NOT EXISTS idx_cards_menu_id ON cards(menu_id);
CREATE INDEX IF NOT EXISTS idx_friend_links_order_index ON friend_links(order_index);

INSERT INTO menus (name, icon, order_index)
SELECT '快速入口', 'mdi-flash', 0
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE name = '快速入口');

INSERT INTO menus (name, icon, order_index)
SELECT '常用工具', 'mdi-tools', 1
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE name = '常用工具');

INSERT INTO cards (menu_id, title, url, icon)
SELECT
  (SELECT id FROM menus WHERE name = '快速入口'),
  'GitHub',
  'https://github.com',
  'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
WHERE NOT EXISTS (SELECT 1 FROM cards WHERE title = 'GitHub');

INSERT INTO cards (menu_id, title, url, icon)
SELECT
  (SELECT id FROM menus WHERE name = '常用工具'),
  'Stack Overflow',
  'https://stackoverflow.com',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM cards WHERE title = 'Stack Overflow');

INSERT INTO ads (image, link)
SELECT '/uploads/default-favicon.png', NULL
WHERE NOT EXISTS (SELECT 1 FROM ads);

INSERT INTO friend_links (name, url, logo, order_index)
SELECT 'Nav 示例', 'https://nav.example.com', NULL, 0
WHERE NOT EXISTS (SELECT 1 FROM friend_links WHERE url = 'https://nav.example.com');
`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, 'database', 'schema.sql');
const dbFilePath = path.resolve(__dirname, DB_PATH);

ensureDatabaseDirectory();

const dbExists = fs.existsSync(dbFilePath);
if (!dbExists) {
  console.log('⚠️  Database file not found, will create new database');
} else {
  try {
    const content = fs.readFileSync(dbFilePath, 'utf8');
    if (content.includes('CREATE TABLE')) {
      console.log('⚠️  Invalid database file detected (text schema), removing...');
      fs.unlinkSync(dbFilePath);
    }
  } catch (err) {
    // Binary file, likely a valid database
  }
}

export const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1);
  } else {
    console.log('✅ 已连接 SQLite 数据库:', dbFilePath);
    initializeDatabase();
  }
});

function ensureDatabaseDirectory() {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ensureSchemaFile() {
  if (fs.existsSync(schemaPath)) {
    return;
  }

  console.error('❌ Schema file not found:', schemaPath);
  console.log('🛠  正在生成默认的 schema 文件...');

  try {
    fs.mkdirSync(path.dirname(schemaPath), { recursive: true });
    fs.writeFileSync(schemaPath, `${DEFAULT_SCHEMA.trim()}\n`, 'utf8');
    console.log('✅ 默认 schema 文件已生成');
  } catch (error) {
    console.error('❌ 无法创建默认 schema 文件:', error.message);
    console.error('   请检查文件系统权限或手动提供 database/schema.sql 文件。');
    process.exit(1);
  }
}

function loadSchema() {
  try {
    return fs.readFileSync(schemaPath, 'utf8');
  } catch (error) {
    console.error('❌ 无法读取 schema 文件:', error.message);
    return null;
  }
}

function initializeDatabase() {
  ensureSchemaFile();
  const schema = loadSchema();

  if (!schema || !schema.trim()) {
    console.error('❌ schema 文件为空或无法读取，数据库初始化失败。');
    process.exit(1);
  }

  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.warn('⚠️  无法启用 SQLite 外键约束:', pragmaErr.message);
      }
    });

    db.exec(schema, (err) => {
      if (err) {
        console.error('❌ 数据库初始化失败:', err.message);
        return;
      }

      verifyTables((verifyErr, missingTables) => {
        if (verifyErr) {
          return;
        }

        if (missingTables.length > 0) {
          console.warn('⚠️  检测到缺失的数据表:', missingTables.join(', '));
          console.log('🛠  尝试重新应用默认 schema...');
          db.exec(DEFAULT_SCHEMA, (fallbackErr) => {
            if (fallbackErr) {
              console.error('❌ 重新应用默认 schema 失败:', fallbackErr.message);
              return;
            }

            verifyTables((finalErr, stillMissing) => {
              if (finalErr) {
                return;
              }

              if (stillMissing.length > 0) {
                console.error('❌ 数据库仍然缺少必要的数据表:', stillMissing.join(', '));
                console.error('   请检查 database/schema.sql 的内容是否完整。');
                return;
              }

              finalizeInitialization();
            });
          });
          return;
        }

        finalizeInitialization();
      });
    });
  });
}

function verifyTables(callback) {
  if (!REQUIRED_TABLES.length) {
    callback(null, []);
    return;
  }

  const placeholders = REQUIRED_TABLES.map(() => '?').join(', ');
  const query = `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${placeholders})`;

  db.all(query, REQUIRED_TABLES, (err, rows) => {
    if (err) {
      console.error('❌ 检查数据库表失败:', err.message);
      callback(err);
      return;
    }

    const existing = rows.map((row) => row.name);
    const missing = REQUIRED_TABLES.filter((table) => !existing.includes(table));

    callback(null, missing);
  });
}

function finalizeInitialization() {
  migrateLegacyFriendLinks(() => {
    console.log('✅ 数据库表结构已初始化');
    ensureDefaultAdmin();
  });
}

function migrateLegacyFriendLinks(done) {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='friends'", (err, legacyTable) => {
    if (err) {
      console.warn('⚠️  检查旧版 friends 表失败:', err.message);
      done();
      return;
    }

    if (!legacyTable) {
      done();
      return;
    }

    db.all('SELECT name, url, logo FROM friends ORDER BY id ASC', (selectErr, rows) => {
      if (selectErr) {
        console.warn('⚠️  读取旧版 friends 数据失败:', selectErr.message);
        done();
        return;
      }

      if (!rows.length) {
        done();
        return;
      }

      let stmt;
      try {
        stmt = db.prepare('INSERT OR IGNORE INTO friend_links (name, url, logo) VALUES (?, ?, ?)');
      } catch (prepareErr) {
        console.warn('⚠️  准备迁移旧版友情链接数据失败:', prepareErr.message);
        done();
        return;
      }

      let migrated = 0;

      const insertNext = (index) => {
        if (index >= rows.length) {
          stmt.finalize((finalizeErr) => {
            if (finalizeErr) {
              console.warn('⚠️  迁移旧版友情链接数据时出错:', finalizeErr.message);
            } else if (migrated > 0) {
              console.log(`✅ 已迁移 ${migrated} 条旧版友情链接数据`);
            }
            done();
          });
          return;
        }

        const row = rows[index];
        stmt.run([row.name, row.url, row.logo], function (runErr) {
          if (runErr) {
            if (!runErr.message.includes('UNIQUE constraint failed')) {
              console.warn('⚠️  迁移旧版友情链接数据失败:', runErr.message);
            }
          } else if (this.changes > 0) {
            migrated += 1;
          }

          insertNext(index + 1);
        });
      };

      insertNext(0);
    });
  });
}

function ensureDefaultAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || '123456';

  db.get('SELECT id FROM users WHERE username = ?', [adminUsername], (err, row) => {
    if (err) {
      console.error('❌ 检查管理员用户失败:', err.message);
      return;
    }

    if (!row) {
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [adminUsername, hashedPassword],
        function (insertErr) {
          if (insertErr) {
            console.error('❌ 创建管理员用户失败:', insertErr.message);
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
}
