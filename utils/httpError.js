// utils/httpError.js
export function createHttpError(status, message, options = {}) {
  const error = new Error(message);
  error.status = status;
  error.isHttpError = true;

  if (options.code) {
    error.code = options.code;
  }

  if (options.cause) {
    error.cause = options.cause;
  }

  if (options.details) {
    error.details = options.details;
  }

  if (typeof options.expose === 'boolean') {
    error.expose = options.expose;
  }

  return error;
}

export function isHttpError(error) {
  return Boolean(error && error.isHttpError);
}
