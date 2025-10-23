// routes/user.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 获取所有用户
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 修改密码
router.put('/:id/password', authMiddleware, (req, res) => {
  const { password } = req.body;
  
  if (!password || password.length < 6) {
    return res.status(400).json({ error: '密码长度至少为6个字符' });
  }
  
  const hashed = bcrypt.hashSync(password, 10);

  db.run('UPDATE users SET password=? WHERE id=?', [hashed, req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: '密码更新成功' });
  });
});

// 删除用户
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM users WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: '用户删除成功' });
  });
});

export default router;
// user.js 路由文件
