// app.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PORT } from './config.js';
import { db } from './db.js';

// 路由导入
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import cardRoutes from './routes/card.js';
import adRoutes from './routes/ad.js';
import friendRoutes from './routes/friend.js';
import userRoutes from './routes/user.js';

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

const corsOptions =
  allowedOrigins && !allowedOrigins.includes('*')
    ? { origin: allowedOrigins, credentials: true }
    : {};

if (allowedOrigins) {
  console.log(
    '✅ CORS 已配置允许来源:',
    allowedOrigins.includes('*') ? '全部来源' : allowedOrigins
  );
}

// 中间件
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件 (比如上传目录)
app.use('/uploads', express.static('uploads'));

// 前端静态文件（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('web/dist'));
}

// 路由注册
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/card', cardRoutes);
app.use('/api/ad', adRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api/user', userRoutes);

// 测试接口
app.get('/', (req, res) => {
  res.json({ message: 'Nav Website Backend API Running 🚀' });
});

// 404 处理
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: '接口不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(
    `[${status}] ${req.method} ${req.originalUrl}`,
    err.stack || err.message || err
  );
  res.status(status).json({
    error: err.message || '服务器内部错误',
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
