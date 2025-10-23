// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbReady, runAsync, getAsync } from '../db.js';
import { JWT_SECRET } from '../config.js';
import { createHttpError, isHttpError } from '../utils/httpError.js';
import { ensureTrimmedString } from '../utils/validators.js';

const router = express.Router();

// 注册
router.post('/register', async (req, res, next) => {
  try {
    await dbReady;
    const { username, password } = req.body;

    const sanitizedUsername = ensureTrimmedString(username, '用户名', {
      code: 'USERNAME_REQUIRED',
      message: '用户名和密码不能为空',
    });

    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 50) {
      throw createHttpError(400, '用户名长度必须在 3-50 个字符之间', {
        code: 'USERNAME_LENGTH_INVALID',
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      throw createHttpError(400, '密码长度至少为 6 个字符', {
        code: 'PASSWORD_TOO_SHORT',
      });
    }

    const existingUser = await getAsync('SELECT id FROM users WHERE username = ?', [
      sanitizedUsername,
    ]);

    if (existingUser) {
      throw createHttpError(409, '用户名已存在', {
        code: 'USERNAME_EXISTS',
      });
    }

    const hashed = bcrypt.hashSync(password, 10);

    const result = await runAsync(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [sanitizedUsername, hashed]
    );

    res.status(201).json({ message: '注册成功', id: result.lastID });
  } catch (error) {
    if (!isHttpError(error)) {
      if (error?.code === 'SQLITE_CONSTRAINT') {
        error = createHttpError(409, '用户名已存在', {
          code: 'USERNAME_EXISTS',
          cause: error,
        });
      } else {
        error = createHttpError(500, '注册失败', {
          code: 'REGISTER_FAILED',
          cause: error,
        });
      }
    }
    next(error);
  }
});

// 登录
router.post('/login', async (req, res, next) => {
  try {
    await dbReady;
    const { username, password } = req.body;

    const sanitizedUsername = ensureTrimmedString(username, '用户名', {
      code: 'USERNAME_REQUIRED',
      message: '用户名和密码不能为空',
    });

    if (typeof password !== 'string' || password.length === 0) {
      throw createHttpError(400, '用户名和密码不能为空', {
        code: 'PASSWORD_REQUIRED',
      });
    }

    const user = await getAsync('SELECT * FROM users WHERE username = ?', [
      sanitizedUsername,
    ]);

    if (!user) {
      throw createHttpError(401, '用户不存在', {
        code: 'USER_NOT_FOUND',
      });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      throw createHttpError(401, '密码错误', {
        code: 'PASSWORD_INCORRECT',
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: '登录成功', token });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '登录失败', {
        code: 'LOGIN_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

export default router;
