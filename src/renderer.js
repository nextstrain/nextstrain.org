/**
 * Server-side rendering with React and HTM.
 *
 * @module renderer
 */
import { html } from 'htm/react';
import { renderToPipeableStream } from 'react-dom/server';


export const sendPage = (Page) => async (req, res) => {
  /* Pass a fixed set of global (i.e. request-scoped) props to every page
   * component.  This is the "Page" interface, which we could enshrine in a
   * Page type if we used TypeScript (or a Page base class if we used class
   * components instead of function components).
   */
  const doc = html`
    <${Page}
      currentUser=${req.user} />
  `;

  /* XXX TODO: Once web streams are non-experimental in Node.js¹, we can use
   * React's renderToReadableStream()² instead and avoid this manual Promise
   * bookkeeping.
   *   -trs, 30 March 2023
   *
   * ¹ <https://nodejs.org/docs/latest-v18.x/api/webstreams.html>
   * ² <https://react.dev/reference/react-dom/server/renderToReadableStream>
   */
  return new Promise((resolve, reject) => {
    const { pipe } = renderToPipeableStream(doc, {
      /* XXX TODO: Maybe move this into onShellReady() and use a streaming
       * render?  But downside is that the generated HTML is less accessible to
       * search and other programmatic access.  If we keep rendering fast,
       * streaming is probably unnecessary complexity.
       *   -trs, 10 April 2023
       */
      onAllReady() {
        res.set("Content-Type", "text/html");
        pipe(res);
        res.end();
        return resolve();
      },

      // XXX FIXME: Error handling with onShellError() and onError()

      /* XXX TODO: We can support client-side components as islands by
       * arranging for a client-side module (via bootstrapModules) to call
       * hydrateRoot() on each client-side component's root element.  If we
       * need to pass any server-side bookkeeping during render to the client,
       * we can communicate that (e.g. as JSON) via "bootstrapScriptContent".
       * I don't think we'll need to, though.
       *   -trs, 10 April 2023
       */
      // bootstrapModules: ["/static/js/….js"],
      // bootstrapScriptContent: `window.… = ${JSON.stringify(…)}`,
    });
  });
};
