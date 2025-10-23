// config.js
export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';
export const DB_PATH = process.env.DB_PATH || process.env.DATABASE_URL || './database/nav.db';
