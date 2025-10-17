// routes/menu.js
import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// 获取所有菜单
router.get('/', (req, res) => {
  db.all('SELECT * FROM menus ORDER BY order_index ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 新建菜单
router.post('/', (req, res) => {
  const { name, icon, order_index } = req.body;
  db.run(
    'INSERT INTO menus (name, icon, order_index) VALUES (?, ?, ?)',
    [name, icon, order_index || 0],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID, message: '菜单创建成功' });
    }
  );
});

// 更新菜单
router.put('/:id', (req, res) => {
  const { name, icon, order_index } = req.body;
  db.run(
    'UPDATE menus SET name=?, icon=?, order_index=? WHERE id=?',
    [name, icon, order_index, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: '菜单更新成功' });
    }
  );
});

// 删除菜单
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM menus WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: '菜单删除成功' });
  });
});

export default router;
// menu.js 路由文件
