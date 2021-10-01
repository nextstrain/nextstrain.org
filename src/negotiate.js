const {NotAcceptable} = require("http-errors");
const mime = require("mime");


/**
 * Generates a routing function which dispatches to Content-Type specific
 * handlers depending on what the request Accepts.
 *
 * Express 4.x includes the the `res.format()` method, but it doesn't support
 * async handlers.
 *
 * @param {Array[]}  providers      - Array of [Content-Type, handler] tuples
 * @param {String}   providers[][0] - Content-Type or shorthand like `json` or `html`
 * @param {Function} providers[][1] - Handler function that produces the associated Content-Type; may be async
 *
 * @returns {Function} An async routing function which will perform the dispatch.
 */
function contentTypesProvided(providers) {
  const types = providers.map(([type, handler]) => type); // eslint-disable-line no-unused-vars
  const handlers = Object.fromEntries(providers);

  return async function dispatchByContentType(req, res, next) {
    res.vary("Accept");

    const contentType = req.accepts(types);
    if (!contentType) {
      throw new NotAcceptable();
    }

    const normalizedContentType = mime.getType(contentType);
    if (normalizedContentType) {
      res.set("Content-Type", normalizedContentType);
    }

    return await handlers[contentType](req, res, next);
  };
}


module.exports = {
  contentTypesProvided,
};
