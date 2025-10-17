// ad.js 路由文件
// routes/ad.js
import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// 获取广告列表
router.get('/', (req, res) => {
  db.all('SELECT * FROM ads', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 添加广告
router.post('/', (req, res) => {
  const { image, link } = req.body;
  db.run('INSERT INTO ads (image, link) VALUES (?, ?)', [image, link], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, message: '广告添加成功' });
  });
});

// 更新广告
router.put('/:id', (req, res) => {
  const { image, link } = req.body;
  db.run('UPDATE ads SET image=?, link=? WHERE id=?', [image, link, req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: '广告更新成功' });
  });
});

// 删除广告
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM ads WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: '广告删除成功' });
  });
});

export default router;
