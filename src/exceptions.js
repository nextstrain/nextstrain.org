/* A base error class for our custom internal errors.
 */
class NextstrainError extends Error {
  constructor(...params) {
    super(...params);
    this.name = this.constructor.name;
  }
}


/**
 * Thrown when a token renewal attempt is made with an invalid refresh token.
 * See {@link module:./authn.renewTokens}.
 */
class AuthnRefreshTokenInvalid extends NextstrainError {}


/**
 * Thrown when a token is unacceptably old, e.g. when it was issued at a time
 * known to be before our staleness horizon for the user.
 *
 * Typically triggers a renewal attempt like an expired token would.
 *
 * See {@link module:./authn.verifyToken}.
 */
class AuthnTokenTooOld extends NextstrainError {}


/* Thrown when a user is not authorized to do something.  Turned into an
 * appropriate HTTP response by our server-wide error handler.
 */
class AuthzDenied extends NextstrainError {}


export {
  AuthnRefreshTokenInvalid,
  AuthnTokenTooOld,
  AuthzDenied,
};
