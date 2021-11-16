const {NotAcceptable} = require("http-errors");
const mime = require("mime");


/**
 * Generates a routing function which dispatches to Content-Type specific
 * handlers depending on what the request Accepts.
 *
 * Express 4.x includes the the `res.format()` method, but it doesn't support
 * async handlers.
 *
 * More than one handler for a type may be provided, in which case a stack of
 * handlers is formed, like Express route handlers (but without any
 * array-flattening behaviour).  In this case, all but the last handler in the
 * stack should call "return next()" or "await next()" in order to chain to the
 * next handler in the stack (unless that is not desired).
 *
 * @param {Array[]}  providers      - Array of [Content-Type, handler] tuples
 * @param {String}   providers[][0] - Content-Type or shorthand like `json` or `html`
 * @param {Function} providers[][1] - Handler function that produces the associated Content-Type; may be async
 *
 * @returns {Function} An async routing function which will perform the dispatch.
 */
function contentTypesProvided(providers) {
  const types = providers.map(([type, ...handlers]) => type); // eslint-disable-line no-unused-vars
  const handlersByType = Object.fromEntries(providers.map(([type, ...handlers]) => [type, handlers]));

  return async function dispatchByContentType(req, res, next) {
    // Check request Accept: against our Content-Type providers.
    res.vary("Accept");

    const contentType = req.accepts(types);
    if (!contentType) {
      throw new NotAcceptable();
    }

    // We have a matching Content-Type; set the response header.
    let normalizedContentType = mime.getType(contentType) || contentType;

    // Express adds the charset for application/json, but not
    // application/*+json, so do that ourselves.
    if (normalizedContentType.match(/^application\/.*?\+json$/)) {
      normalizedContentType += "; charset=utf-8";
    }

    res.set("Content-Type", normalizedContentType);

    // Multiple handlers may be given, in which case they must call either
    // `return next()` or `await next()`.
    const handlers = handlersByType[contentType];
    let handlerIdx = 0;

    async function nextHandler(err) {
      if (err) return next(err);

      const handler = handlers[handlerIdx++];
      if (!handler) return next();

      return await handler(req, res, nextHandler);
    }

    return await nextHandler();
  };
}


module.exports = {
  contentTypesProvided,
};
