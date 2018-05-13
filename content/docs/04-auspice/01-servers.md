---
title: "Servers!"
date: "2018-05-09"
---

Serving things is different in different contexts, hopefully this will clear things up!

### Repository: (unnamed) static site
This is a gatsby static site, and as such doesn't use a server.
Running `npm run build` generates the files, which can be viewed via `/public/index.html`.
There _is_ a development server (`npm run dev`).

### Repository: Auspice
Developing and viewing auspice locally requires a server to be running to serve the JSONs.
This is a simple node-js server (`server.js`) which is transpiled to `server.dist.js` via webpack (part of `npm run build`).
Most of the logic of the server is sourced from files within `src/server`.
Arguments provided to the (built) server give you control over where the data comes from:

* By default, the API calls go to wherever you're running this server.
I.e. if this is via localhost, then it's localhost:4000/charon, if this is deployed on heroku, it's nextstrain.org/charon.

* **dev** runs the dev server, with react hot loading etc. If this is not present then
the production server is run, which sources the bundle from dist/
(i.e. you have to run "npm run build" first).

* **localData** Sources the JSONs / splash images etc from /data/ rather than data.nextstrain.org.
This works even if you've built the bundle, as the API calls are handled by the same server.
You probably want this on for development, off for testing before deploying.

* **localStatic** Sources the Static posts (reports) from /static/ rather than github.com/nextstrain/nextstrain.org.
This works even if you've built the bundle, as the API calls are handled by the same server.
You probably want this on for development, off for testing before deploying.


### Repository: nextstrain.org (Containing both the static site and auspice)
This server decides (based on the path) whether to serve the static files or auspice, as well as containing the auspice API logic (sourced from `/auspice/src/server`).
Common endpoints:

* `/` goes to the gatsby index.html
* gatsby pages are hardcoded into the server so that they are handled via static middleware pointing to `/static/public/`
* `/charon?` requests are handled via the appropriate (auspice) API
* Everything else goes to auspice, which appropriately handles unknown destinations
