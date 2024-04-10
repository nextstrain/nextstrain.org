import stream from 'stream';
import { promisify } from 'util';
import { PRODUCTION } from '../config.js';
import * as utils from '../utils/index.js';
import { Forbidden, NotFound, Unauthorized } from '../httpErrors.js';
import * as endpoints from '../endpoints/index.js';
import { AuthzDenied } from '../exceptions.js';


/* XXX TODO: Replace promisify() with require("stream/promises") once we
 * upgrade to Node 15+.
 *   -trs, 5 Nov 2021
 */
const streamFinished = promisify(stream.finished);

const jsonMediaType = type => type.match(/^application\/(.+\+)?json$/);


/** Set up error handling. Should be done after all routes are added.
 */
export async function setup(app) {

  /* Everything else gets 404ed.
   */
  app.use((req, res, next) => next(new NotFound()));


  /* Error handler
   */
  app.useAsync(async (err, req, res, next) => {
    /* XXX TODO: Replace calls to Express' next() with calls to our own custom
     * finalhandler (the library Express uses) function configured with an
     * "onerror" handler that does what we want with regard to logging.
     *   -trs, 1 Oct 2021
     */
    if (res.headersSent) {
      utils.verbose("Headers already sent; using Express' default error handler");
      return next(err);
    }

    /* Read the entire request body (discarding it) if the request might have a
     * body and wasn't made with Expect: 100-continue, or if it was and we wrote
     * a 100 Continue response but then ended up here.  This ensures that the
     * request is finished being sent before we return a (error) response, which
     * some clients require (such as Heroku's routing/proxy layer and the Python
     * "requests" package, but notably not curl).
     */
    const mayHaveBody = !["GET", "HEAD", "DELETE", "OPTIONS"].includes(req.method);

    if (mayHaveBody && (!req.expectsContinue || res.wroteContinue)) {
      const reqFinished = streamFinished(req);
      req.unpipe();
      req.resume();
      await reqFinished;
    }

    res.vary("Accept");

    /* "Is this request browser-like?"  Checking for explicit inclusion of
     * "text/html" is an imperfect heuristic, but still useful enough and doesn't
     * require user-agent matching, which seems more fraught and more opaque.
     *
     * Note that we don't check req.accepts("text/html"), because that'll match
     * wildcard Accept values which are sent by ~every client.
     *   -trs, 25 Jan 2022
     */
    const isBrowserLike = req.accepts().includes("text/html");

    /* Handle our authorization denied errors differently depending on if the
     * request is authenticated or not and if the client is browser-like or not.
     *
     * The intended audience for the redirect is humans following bookmarks,
     * browser history, or other saved links, which will only ever be GET (and
     * _maybe_ HEAD).
     *
     * An additional redirect condition on navigation (vs. background request)
     * would also be nice, but I can't find any good heuristic for that.
     * The following seems ideal:
     *
     *    const isNavigation = req.headers['sec-fetch-mode'] === "navigate";
     *
     * but it is not supported by Safari (macOS or iOS).
     *   -trs, 25 Jan 2022
     */
    if (err instanceof AuthzDenied) {
      if (!req.user) {
        if (["GET", "HEAD"].includes(req.method) && isBrowserLike) {
          utils.verbose(`Redirecting anonymous user to login page from ${req.originalUrl}`);
          req.session.afterLoginReturnTo = req.originalUrl;
          return res.redirect("/login");
        }
        err = new Unauthorized(err.message);
      } else {
        err = new Forbidden(err.message);
      }
    }

    /* Browser-like clients get JSON if they explicitly ask for it (regardless of
     * priority, and including our custom +json types) and all non-browser like
     * clients get JSON.
     */
    if (req.accepts().some(jsonMediaType) || !isBrowserLike) {
      utils.verbose(`Sending ${err} error as JSON`);
      return res.status(err.status || err.statusCode || 500)
        .json({
          error: err.message || String(err),
          ...(
            !PRODUCTION
              ? {stack: err.stack}
              : {}
          ),
        })
        .end();
    }

    if (err instanceof NotFound) {
      /* A note about routing: if the current URL path (i.e. req.path) matches a
       * a page known to the NextJS routes ("pages") then that page will be
       * shown (with response code 200). Moving to server-side rendering of
       * NotFound errors (and InternalServerError etc) will not only solve this
       * but will also allow us to provide information about the error. See the
       * following issues for more:
       * <https://github.com/nextstrain/nextstrain.org/issues/774>
       * <https://github.com/nextstrain/nextstrain.org/issues/518>
       */
      return await endpoints.nextJsApp.handleRequest(req, res);
    }

    utils.verbose(`Sending ${err} error as HTML with Express' default error handler`);
    return next(err);
  });
}
