// utils/validators.js
import { createHttpError } from './httpError.js';

export function ensureTrimmedString(value, label, options = {}) {
  const { code = 'FIELD_REQUIRED', message } = options;

  if (typeof value !== 'string') {
    throw createHttpError(400, message ?? `${label}不能为空`, { code });
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw createHttpError(400, message ?? `${label}不能为空`, { code });
  }

  return trimmed;
}

export function ensureOptionalString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function ensurePositiveInt(value, label, options = {}) {
  const { code = 'INVALID_ID', allowZero = false, message } = options;

  const parsed = Number.parseInt(value, 10);
  const isValidInteger = Number.isInteger(parsed);

  if (!isValidInteger) {
    throw createHttpError(400, message ?? `${label}无效`, { code });
  }

  if (allowZero ? parsed < 0 : parsed <= 0) {
    throw createHttpError(400, message ?? `${label}无效`, { code });
  }

  return parsed;
}

export function ensureNonNegativeInt(value, label, options = {}) {
  const { code = 'INVALID_INTEGER', message } = options;

  if (value === undefined || value === null || value === '') {
    return 0;
  }

  const parsed = Number(value);
  const isInteger = Number.isFinite(parsed) && Number.isInteger(parsed);

  if (!isInteger || parsed < 0) {
    throw createHttpError(
      400,
      message ?? `${label}必须是不小于 0 的整数`,
      { code }
    );
  }

  return parsed;
}
