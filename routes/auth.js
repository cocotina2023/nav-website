// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { JWT_SECRET } from '../config.js';

const router = express.Router();

// 注册
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ error: '用户名长度必须在3-50个字符之间' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度至少为6个字符' });
  }
  
  const hashed = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashed],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: '注册成功', id: this.lastID });
    }
  );
});

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: '用户不存在' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: '密码错误' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ message: '登录成功', token });
  });
});

export default router;
// auth.js 路由文件
