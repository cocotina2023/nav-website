// routes/menu.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { dbReady, allAsync, runAsync } from '../db.js';
import { createHttpError, isHttpError } from '../utils/httpError.js';
import {
  ensureTrimmedString,
  ensureOptionalString,
  ensurePositiveInt,
  ensureNonNegativeInt,
} from '../utils/validators.js';

const router = express.Router();

// 获取所有菜单
router.get('/', async (req, res, next) => {
  try {
    await dbReady;
    const menus = await allAsync(
      'SELECT * FROM menus ORDER BY order_index ASC'
    );
    res.json(menus);
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '获取菜单失败', {
        code: 'MENU_LIST_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

// 新建菜单
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const { name, icon, order_index } = req.body;

    const trimmedName = ensureTrimmedString(name, '菜单名称', {
      code: 'MENU_NAME_REQUIRED',
    });

    const orderIndex = ensureNonNegativeInt(order_index, '排序值', {
      code: 'MENU_ORDER_INVALID',
    });
    const sanitizedIcon = ensureOptionalString(icon);

    const result = await runAsync(
      'INSERT INTO menus (name, icon, order_index) VALUES (?, ?, ?)',
      [trimmedName, sanitizedIcon, orderIndex]
    );

    res.status(201).json({
      id: result.lastID,
      message: '菜单创建成功',
    });
  } catch (error) {
    if (!isHttpError(error)) {
      if (error?.code === 'SQLITE_CONSTRAINT') {
        error = createHttpError(409, '菜单已存在', {
          code: 'MENU_DUPLICATED',
          cause: error,
        });
      } else {
        error = createHttpError(500, '菜单创建失败', {
          code: 'MENU_CREATE_FAILED',
          cause: error,
        });
      }
    }
    next(error);
  }
});

// 更新菜单
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const menuId = ensurePositiveInt(req.params.id, '菜单 ID');
    const { name, icon, order_index } = req.body;

    const trimmedName = ensureTrimmedString(name, '菜单名称', {
      code: 'MENU_NAME_REQUIRED',
    });

    const orderIndex = ensureNonNegativeInt(order_index, '排序值', {
      code: 'MENU_ORDER_INVALID',
    });
    const sanitizedIcon = ensureOptionalString(icon);

    const result = await runAsync(
      'UPDATE menus SET name = ?, icon = ?, order_index = ? WHERE id = ?',
      [trimmedName, sanitizedIcon, orderIndex, menuId]
    );

    if (!result.changes) {
      throw createHttpError(404, '菜单不存在', {
        code: 'MENU_NOT_FOUND',
      });
    }

    res.json({ message: '菜单更新成功' });
  } catch (error) {
    if (!isHttpError(error)) {
      if (error?.code === 'SQLITE_CONSTRAINT') {
        error = createHttpError(409, '菜单已存在', {
          code: 'MENU_DUPLICATED',
          cause: error,
        });
      } else {
        error = createHttpError(500, '菜单更新失败', {
          code: 'MENU_UPDATE_FAILED',
          cause: error,
        });
      }
    }
    next(error);
  }
});

// 删除菜单
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const menuId = ensurePositiveInt(req.params.id, '菜单 ID');

    const result = await runAsync('DELETE FROM menus WHERE id = ?', [menuId]);

    if (!result.changes) {
      throw createHttpError(404, '菜单不存在', {
        code: 'MENU_NOT_FOUND',
      });
    }

    res.json({ message: '菜单删除成功' });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '菜单删除失败', {
        code: 'MENU_DELETE_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

export default router;
// menu.js 路由文件
