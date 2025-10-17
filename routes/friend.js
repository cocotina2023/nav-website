// routes/friend.js
import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// 获取友情链接
router.get('/', (req, res) => {
  db.all('SELECT * FROM friends', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 添加友链
router.post('/', (req, res) => {
  const { name, url, logo } = req.body;
  db.run('INSERT INTO friends (name, url, logo) VALUES (?, ?, ?)', [name, url, logo], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, message: '友链添加成功' });
  });
});

// 更新友链
router.put('/:id', (req, res) => {
  const { name, url, logo } = req.body;
  db.run('UPDATE friends SET name=?, url=?, logo=? WHERE id=?', [name, url, logo, req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: '友链更新成功' });
  });
});

// 删除友链
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM friends WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: '友链删除成功' });
  });
});

export default router;
// friend.js 路由文件
