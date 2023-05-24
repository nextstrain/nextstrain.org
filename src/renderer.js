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

      /**
       * Load client components as ESM. These have been already bundled
       * and are available in /assets/bundles/*.js. Currently we bundle all
       * dependencies together, but since our current implementation uses
       * React each time we should pull that out of the bundle and load it
       * separately (either as UMD from a CDN, or an ESM we produce).
       *
       * Currently this only allows a single client component -- probably fine for now
       * but there are ways to use multiple components, each taking control over
       * a separate DOM element.
       */
      bootstrapModules: typeof Page.clientComponent === "string" ?
        [`/assets/bundles/${Page.clientComponent}`] :
        []

      // XXX FIXME: Error handling with onShellError() and onError()

      /* If we need to pass any server-side bookkeeping during render to the client,
       * we can communicate that (e.g. as JSON) via "bootstrapScriptContent".
       * I don't think we'll need to, though.
       *   -trs, 10 April 2023
       */
      // bootstrapScriptContent: `window.… = ${JSON.stringify(…)}`,
    });
  });
};
