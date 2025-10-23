// routes/user.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth.js';
import { dbReady, allAsync, runAsync } from '../db.js';
import { createHttpError, isHttpError } from '../utils/httpError.js';
import { ensurePositiveInt } from '../utils/validators.js';

const router = express.Router();

// 获取所有用户
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const users = await allAsync('SELECT id, username FROM users ORDER BY id ASC');
    res.json(users);
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '获取用户列表失败', {
        code: 'USER_LIST_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

// 修改密码
router.put('/:id/password', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const userId = ensurePositiveInt(req.params.id, '用户 ID');
    const { password } = req.body;

    if (typeof password !== 'string' || password.length === 0) {
      throw createHttpError(400, '密码长度至少为 6 个字符', {
        code: 'PASSWORD_REQUIRED',
      });
    }

    if (password.length < 6) {
      throw createHttpError(400, '密码长度至少为 6 个字符', {
        code: 'PASSWORD_TOO_SHORT',
      });
    }

    const hashed = bcrypt.hashSync(password, 10);

    const result = await runAsync('UPDATE users SET password = ? WHERE id = ?', [
      hashed,
      userId,
    ]);

    if (!result.changes) {
      throw createHttpError(404, '用户不存在', {
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({ message: '密码更新成功' });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '密码更新失败', {
        code: 'PASSWORD_UPDATE_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

// 删除用户
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const userId = ensurePositiveInt(req.params.id, '用户 ID');

    const result = await runAsync('DELETE FROM users WHERE id = ?', [userId]);

    if (!result.changes) {
      throw createHttpError(404, '用户不存在', {
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({ message: '用户删除成功' });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '用户删除失败', {
        code: 'USER_DELETE_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

export default router;
// user.js 路由文件
