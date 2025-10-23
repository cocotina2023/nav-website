// database/init.js - Database initialization script
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || './database/nav.db';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

console.log('🔧 Initializing database...');

// Delete existing database if it's not a valid SQLite file
try {
  if (fs.existsSync(DB_PATH)) {
    const content = fs.readFileSync(DB_PATH, 'utf8');
    if (content.includes('CREATE TABLE')) {
      console.log('⚠️  Found invalid database file (text schema), removing...');
      fs.unlinkSync(DB_PATH);
    }
  }
} catch (err) {
  // If error reading as text, it might be a valid binary database
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Read schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Execute schema
db.exec(schema, (err) => {
  if (err) {
    console.error('❌ Schema creation failed:', err.message);
    db.close();
    process.exit(1);
  }
  console.log('✅ Database schema created');

  // Check if admin user exists
  db.get('SELECT * FROM users WHERE username = ?', [ADMIN_USERNAME], (err, row) => {
    if (err) {
      console.error('❌ Error checking for admin user:', err.message);
      db.close();
      process.exit(1);
    }

    if (!row) {
      // Create admin user
      const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [ADMIN_USERNAME, hashedPassword],
        function (err) {
          if (err) {
            console.error('❌ Error creating admin user:', err.message);
            db.close();
            process.exit(1);
          }
          console.log(`✅ Admin user created: ${ADMIN_USERNAME}`);
          console.log(`🔑 Default password: ${ADMIN_PASSWORD}`);
          console.log('⚠️  Please change the password after first login!');
          db.close();
        }
      );
    } else {
      console.log(`✅ Admin user already exists: ${ADMIN_USERNAME}`);
      db.close();
    }
  });
});
