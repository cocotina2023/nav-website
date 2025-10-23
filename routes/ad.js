// routes/ad.js
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

// 获取广告列表
router.get('/', async (req, res, next) => {
  try {
    await dbReady;
    const ads = await allAsync('SELECT * FROM ads ORDER BY id DESC');
    res.json(ads);
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '获取广告列表失败', {
        code: 'AD_LIST_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

// 添加广告
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const { image, link } = req.body;

    const sanitizedImage = ensureTrimmedString(image, '广告图片地址', {
      code: 'AD_IMAGE_REQUIRED',
    });
    const sanitizedLink = ensureOptionalString(link);

    const result = await runAsync(
      'INSERT INTO ads (image, link) VALUES (?, ?)',
      [sanitizedImage, sanitizedLink]
    );

    res.status(201).json({
      id: result.lastID,
      message: '广告添加成功',
    });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '广告添加失败', {
        code: 'AD_CREATE_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

// 更新广告
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const adId = ensurePositiveInt(req.params.id, '广告 ID');
    const { image, link } = req.body;

    const sanitizedImage = ensureTrimmedString(image, '广告图片地址', {
      code: 'AD_IMAGE_REQUIRED',
    });
    const sanitizedLink = ensureOptionalString(link);

    const result = await runAsync(
      'UPDATE ads SET image = ?, link = ? WHERE id = ?',
      [sanitizedImage, sanitizedLink, adId]
    );

    if (!result.changes) {
      throw createHttpError(404, '广告不存在', {
        code: 'AD_NOT_FOUND',
      });
    }

    res.json({ message: '广告更新成功' });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '广告更新失败', {
        code: 'AD_UPDATE_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

// 删除广告
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await dbReady;
    const adId = ensurePositiveInt(req.params.id, '广告 ID');

    const result = await runAsync('DELETE FROM ads WHERE id = ?', [adId]);

    if (!result.changes) {
      throw createHttpError(404, '广告不存在', {
        code: 'AD_NOT_FOUND',
      });
    }

    res.json({ message: '广告删除成功' });
  } catch (error) {
    if (!isHttpError(error)) {
      error = createHttpError(500, '广告删除失败', {
        code: 'AD_DELETE_FAILED',
        cause: error,
      });
    }
    next(error);
  }
});

export default router;
