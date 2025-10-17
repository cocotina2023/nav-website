// routes/card.js
import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// 获取所有卡片（可选按菜单分类）
router.get('/', (req, res) => {
  const { menu_id } = req.query;
  let sql = 'SELECT * FROM cards';
  const params = [];

  if (menu_id) {
    sql += ' WHERE menu_id = ?';
    params.push(menu_id);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 新增卡片
router.post('/', (req, res) => {
  const { title, url, icon, menu_id } = req.body;
  db.run(
    'INSERT INTO cards (title, url, icon, menu_id) VALUES (?, ?, ?, ?)',
    [title, url, icon, menu_id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID, message: '卡片创建成功' });
    }
  );
});

// 更新卡片
router.put('/:id', (req, res) => {
  const { title, url, icon, menu_id } = req.body;
  db.run(
    'UPDATE cards SET title=?, url=?, icon=?, menu_id=? WHERE id=?',
    [title, url, icon, menu_id, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: '卡片更新成功' });
    }
  );
});

// 删除卡片
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM cards WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: '卡片删除成功' });
  });
});

export default router;
// card.js 路由文件
