// routes/card.js
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

// 获取所有卡片（可选按菜单分类）
router.get('/', async (req, res, next) => {
  try {
    await dbReady;
    const { menu_id: menuIdParam } = req.query;

    let sql = 'SELECT * FROM cards';
    const params = [];
    const hasMenuId = menuIdParam !== undefined && menuIdParam !== null && menuIdParam !== '';

    if (hasMenuId) {
      const menuId = ensurePositiveInt(menuIdParam, '菜单 ID');
      sql += ' WHERE menu_id = ?';
      params.push(menuId);
    }

    sql += ' ORDER BY id DESC';

    const cards = await allAsync(sql, params);
    res.json(cards);
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '获取卡片列表失败', {
        code: 'CARD_LIST_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

// 新增卡片
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const { title, url, icon, menu_id } = req.body;

    const trimmedTitle = ensureTrimmedString(title, '卡片标题', {
      code: 'CARD_TITLE_REQUIRED',
    });
    const trimmedUrl = ensureTrimmedString(url, '卡片链接', {
      code: 'CARD_URL_REQUIRED',
    });
    const sanitizedIcon = ensureOptionalString(icon);
    const menuId = menu_id === undefined || menu_id === null || menu_id === ''
      ? null
      : ensurePositiveInt(menu_id, '菜单 ID');

    const result = await runAsync(
      'INSERT INTO cards (title, url, icon, menu_id) VALUES (?, ?, ?, ?)',
      [trimmedTitle, trimmedUrl, sanitizedIcon, menuId]
    );

    res.status(201).json({
      id: result.lastID,
      message: '卡片创建成功',
    });
  } catch (error) {
    if (!isHttpError(error)) {
      if (error?.code === 'SQLITE_CONSTRAINT') {
        error = createHttpError(400, '关联的菜单不存在', {
          code: 'CARD_MENU_NOT_FOUND',
          cause: error,
        });
      } else {
        error = createHttpError(500, '卡片创建失败', {
          code: 'CARD_CREATE_FAILED',
          cause: error,
        });
      }
    }
    next(error);
  }
});

// 更新卡片
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const cardId = ensurePositiveInt(req.params.id, '卡片 ID');
    const { title, url, icon, menu_id } = req.body;

    const trimmedTitle = ensureTrimmedString(title, '卡片标题', {
      code: 'CARD_TITLE_REQUIRED',
    });
    const trimmedUrl = ensureTrimmedString(url, '卡片链接', {
      code: 'CARD_URL_REQUIRED',
    });
    const sanitizedIcon = ensureOptionalString(icon);
    const menuId = menu_id === undefined || menu_id === null || menu_id === ''
      ? null
      : ensurePositiveInt(menu_id, '菜单 ID');

    const result = await runAsync(
      'UPDATE cards SET title = ?, url = ?, icon = ?, menu_id = ? WHERE id = ?',
      [trimmedTitle, trimmedUrl, sanitizedIcon, menuId, cardId]
    );

    if (!result.changes) {
      throw createHttpError(404, '卡片不存在', {
        code: 'CARD_NOT_FOUND',
      });
    }

    res.json({ message: '卡片更新成功' });
  } catch (error) {
    if (!isHttpError(error)) {
      if (error?.code === 'SQLITE_CONSTRAINT') {
        error = createHttpError(400, '关联的菜单不存在', {
          code: 'CARD_MENU_NOT_FOUND',
          cause: error,
        });
      } else {
        error = createHttpError(500, '卡片更新失败', {
          code: 'CARD_UPDATE_FAILED',
          cause: error,
        });
      }
    }
    next(error);
  }
});

// 删除卡片
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const cardId = ensurePositiveInt(req.params.id, '卡片 ID');

    const result = await runAsync('DELETE FROM cards WHERE id = ?', [cardId]);

    if (!result.changes) {
      throw createHttpError(404, '卡片不存在', {
        code: 'CARD_NOT_FOUND',
      });
    }

    res.json({ message: '卡片删除成功' });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '卡片删除失败', {
        code: 'CARD_DELETE_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

export default router;
// card.js 路由文件
