PRAGMA foreign_keys = ON;

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
