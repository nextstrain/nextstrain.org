// Wrapper for http-errors to use named exports.
import httpErrors from 'http-errors';

export const {
  BadRequest,
  Forbidden,
  InternalServerError,
  NotAcceptable,
  NotFound,
  Unauthorized,
  UnsupportedMediaType,
  isHttpError,
} = httpErrors;
