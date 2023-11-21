// Wrapper for http-errors to use named exports.
import httpErrors from 'http-errors';

export const {
  BadRequest,
  Forbidden,
  InternalServerError,
  NotAcceptable,
  NotFound,
  ServiceUnavailable,
  Unauthorized,
  UnsupportedMediaType,
  isHttpError,
} = httpErrors;


/**
 * HttpError classes by status code.
 *
 * @type {Object.<string, httpErrors.HttpError>}
 */
export const HttpErrors = Object.fromEntries(
  Object.entries(httpErrors)
    .filter(([status,]) => !!Number(status))
);
