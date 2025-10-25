// app.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const staticDir = path.join(__dirname, 'web', 'dist');
const uploadsDir = path.join(__dirname, 'uploads');

const rawCorsOrigins = process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN ?? null;
const allowedOrigins = rawCorsOrigins
  ? rawCorsOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
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
app.use('/uploads', express.static(uploadsDir));

// 前端静态文件（生产环境）
if (isProduction) {
  if (fs.existsSync(staticDir)) {
    console.log('✅ 正在托管前端静态资源:', staticDir);
    app.use(express.static(staticDir));
  } else {
    console.warn('⚠️ 未找到前端构建产物，SPA 路由可能无法正常工作:', staticDir);
  }
}

const serveSpa = (req, res, next) => {
  const indexPath = path.join(staticDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (!err) {
      return;
    }

    if (err.code === 'ENOENT') {
      console.error('❌ 未找到 SPA 构建入口文件:', indexPath);
      if (!res.headersSent) {
        res.status(500).json({ error: '前端构建资源缺失，请先执行构建。' });
      }
      return;
    }

    next(err);
  });
};

// 健康检查
app.get('/api/health', (req, res) => {
  db.get('SELECT 1 AS result', (err) => {
    const healthy = !err;
    const payload = {
      status: healthy ? 'ok' : 'error',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: healthy ? 'connected' : 'disconnected',
    };

    if (err) {
      console.error('❌ 数据库健康检查失败:', err.message);
      payload.error = err.message;
      res.status(500).json(payload);
      return;
    }

    res.json(payload);
  });
});

// 路由注册
app.use('/api/auth', authRoutes);
app.use(['/api/menus', '/api/menu'], menuRoutes);
app.use(['/api/cards', '/api/card'], cardRoutes);
app.use(['/api/ads', '/api/ad'], adRoutes);
app.use(['/api/friends', '/api/friend'], friendRoutes);
app.use(['/api/users', '/api/user'], userRoutes);

// 根路径 - 在生产环境下回退到 SPA，在开发环境返回简单信息
app.get('/', (req, res, next) => {
  if (isProduction) {
    serveSpa(req, res, next);
    return;
  }

  res.json({ message: 'Nav Website Backend API Running 🚀' });
});

// SPA fallback（必须放在所有路由之后）
app.get('*', (req, res, next) => {
  if (
    req.method !== 'GET' ||
    req.path.startsWith('/api') ||
    req.path.startsWith('/uploads')
  ) {
    next();
    return;
  }

  if (!isProduction) {
    next();
    return;
  }

  const accept = req.headers.accept || '';
  if (accept && !accept.includes('text/html') && !accept.includes('*/*')) {
    next();
    return;
  }

  serveSpa(req, res, next);
});

// 404 处理（主要针对 API）
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    console.warn(`[404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: '接口不存在' });
    return;
  }

  if (req.path.startsWith('/uploads')) {
    res.status(404).send('Not Found');
    return;
  }

  res.status(404).json({ error: 'Not Found' });
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
