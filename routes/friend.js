// routes/friend.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { dbReady, allAsync, runAsync } from '../db.js';
import { createHttpError, isHttpError } from '../utils/httpError.js';
import {
  ensureTrimmedString,
  ensureOptionalString,
  ensurePositiveInt,
} from '../utils/validators.js';

const router = express.Router();

// 获取友情链接
router.get('/', async (req, res, next) => {
  try {
    await dbReady;
    const friends = await allAsync('SELECT * FROM friends ORDER BY id DESC');
    res.json(friends);
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '获取友情链接失败', {
        code: 'FRIEND_LIST_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

// 添加友链
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const { name, url, logo } = req.body;

    const sanitizedName = ensureTrimmedString(name, '友链名称', {
      code: 'FRIEND_NAME_REQUIRED',
    });
    const sanitizedUrl = ensureTrimmedString(url, '友链链接', {
      code: 'FRIEND_URL_REQUIRED',
    });
    const sanitizedLogo = ensureOptionalString(logo);

    const result = await runAsync(
      'INSERT INTO friends (name, url, logo) VALUES (?, ?, ?)',
      [sanitizedName, sanitizedUrl, sanitizedLogo]
    );

    res.status(201).json({
      id: result.lastID,
      message: '友链添加成功',
    });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '友链添加失败', {
        code: 'FRIEND_CREATE_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

// 更新友链
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const friendId = ensurePositiveInt(req.params.id, '友链 ID');
    const { name, url, logo } = req.body;

    const sanitizedName = ensureTrimmedString(name, '友链名称', {
      code: 'FRIEND_NAME_REQUIRED',
    });
    const sanitizedUrl = ensureTrimmedString(url, '友链链接', {
      code: 'FRIEND_URL_REQUIRED',
    });
    const sanitizedLogo = ensureOptionalString(logo);

    const result = await runAsync(
      'UPDATE friends SET name = ?, url = ?, logo = ? WHERE id = ?',
      [sanitizedName, sanitizedUrl, sanitizedLogo, friendId]
    );

    if (!result.changes) {
      throw createHttpError(404, '友链不存在', {
        code: 'FRIEND_NOT_FOUND',
      });
    }

    res.json({ message: '友链更新成功' });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '友链更新失败', {
        code: 'FRIEND_UPDATE_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

// 删除友链
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const friendId = ensurePositiveInt(req.params.id, '友链 ID');

    const result = await runAsync('DELETE FROM friends WHERE id = ?', [friendId]);

    if (!result.changes) {
      throw createHttpError(404, '友链不存在', {
        code: 'FRIEND_NOT_FOUND',
      });
    }

    res.json({ message: '友链删除成功' });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '友链删除失败', {
        code: 'FRIEND_DELETE_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

export default router;
// friend.js 路由文件
