# URL Routing

Routing of URL paths within nextstrain.org is handled by a mixture of server-
side and client-side routing and involves four main components: the (express)
server, the next.js route handler (within the express app), next.js
client-side pages, and auspice (client-side) pages.

When requests arrive at the server the following happens:

  1. If an express route is defined (see "server-side routes", below) the
     appropriate handler is called. The response differs according to the
     specific route / route handler as well as the HTTP verb and the `Accept`
     HTTP header. Commonly we do one of the following:

  - Respond with JSON data
  - Hand control to the next.js route handler (see next point).
  - Respond with the auspice entrypoint HTML `auspice-client/dist/index.html`.
    This page will subsequently make requests to `/dist/*` URLs (to load the JS
    bundle(s), static assets etc), as well as to the Charon API (`/charon/*`
    URLs) to load the data necessary for our phylodynamic visualisation.
  - Throw an HTTP error. `NotFound` (404) is handed to the next.js route handler which
    displays our generic 404 page. Other errors result in plain HTML responses.

  2. In the case where no defined route matches (as well as for for some
     specific routes), we use the next.js route handler to serve pages according
     to its file-based routing. These files are all located within
     `./static-site`. In production mode these are static assets which are
     served, whilst in dev-mode the server will compile them on-the-fly to
     assist development. See the [static-site
     README](https://github.com/nextstrain/nextstrain.org/blob/master/static-site/README.md)
     for more information on this. Next.js client-side pages will make requests
     to `/_next/*` URLs which are also handled by the next.js route handler.

**Client-side routing**

Next.js pages (i.e. the client-side code within `./static-site`) may
perform client-side routing while navigating between pages. Such page changes
make requests to `/_next/*` URLs which are handled by the next.js route handler.
Similarly, Auspice-client pages may change the URL path without making a HTTP
request for that specific page (e.g. when the dataset or narrative changes
within the app).

Notably, these URL routers are all separate and largely do not know of each
other.  This means there can be some unexpected behaviour if routes clash,
particularly between the server-side and client-side routes.

## Server-side routes

The server-side routes try to adhere to some basic organizational principles:

  * Routes (e.g. `/charon/getDataset`) live in `src/routing/` and are documented
    in `src/app.js`.  Having all routes listed in the entrypoint file makes it
    easier to see ordering without cross-referencing across files.

  * Endpoints ("route handlers", e.g. `charon.getDataset(req, res, next)`) live
    in `src/endpoints/`, grouped into arbitrary directories/files/modules as
    seems best for development.

  * The names in route paths and the endpoint source file paths do not
    necessarily need to match, although they may (as in the case of Charon).
    Routes are user-facing, endpoint source file paths are developer-facing.

  * There does not need to be a 1:1 correspondence between a single route and a
    single endpoint source file, although there may be (as in the case of
    Charon). For example, a single file `src/endpoints/groups.js` may define
    several endpoints used for several routes under `/groups/…`.
