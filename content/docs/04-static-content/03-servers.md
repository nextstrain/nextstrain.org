---
title: "Servers!"
date: "2018-05-09"
---

Nextstrain.org really consists of two different codebases, [the static (gatsby) code](https://github.com/nextstrain/static) and the [interactive data visualisation app (auspice)](https://github.com/nextstrain/auspice)).
The server behind www.nextstrain.org chooses whether to serve auspice or static files for a given request.
Additionally each codebase can be build locally on it's own, and so each contains it's own server!

### The request logic for the nextstrain.org

This server decides (based on the path) whether to serve the static files or auspice -- the [sourcecode](https://github.com/nextstrain/nextstrain.org/blob/master/server.js) is relatively simple.
It imports some files from the `auspice` directory to prevent code duplication, and has access to the built static site (i.e. `static/public`) and the build auspice bundle (`auspice/dist`).
Here is the basic routing logic:

* `/` points to the static site (this is the splash page)
* (Static-site) routes starting with "about", "docs" etc are handled via static middleware pointing to `/static/public/`
* Routes starting with `/charon` are auspice API requests and are handled appropriately.
Mostly these are involved with serving data JSONs for visualisation.
The logic of this is contained in the auspice repo.
* Everything else goes to auspice. This allows "hidden" datasets to be accessed via their URLs. It also means that most invalid URLs (404s) are handled by auspic.


### The static site server in isolation
This is a gatsby static site, and as such simply serves built files from `./public`
Running `npm run build` generates the files, and `npm run serve` allows the website to be accessed at [http://localhost:8000](http://localhost:8000)
There is also a development server (`npm run dev`), which updates on the fly as you modify files.


### The Auspice server
Auspice can be run locally, either for development or for viewing local data, each of which requires a server to be running to serve the JSONs.
This is a simple node-js server (`server.js`) which is transpiled to `server.dist.js` via webpack (part of `npm run build`).
Most of the logic of the server is sourced from files within `src/server`.
Arguments provided to the (built) server give you control over where the data comes from:

> Please note - there is a outstanding [github issue](https://github.com/nextstrain/auspice/issues/564) which aims to simplify these arguments.
> Also, the navigation bar (with "about", "docs") doesn't work on a local build, as a local build doesn't included the static site!

* By default, the API calls go to wherever you're running this server.
I.e. if this is via localhost, then it's localhost:4000/charon, if this is deployed on heroku, it's nextstrain.org/charon.

* `dev` runs the dev server, with react hot loading etc. If this is not present then
the production server is run, which sources the bundle from dist/
(i.e. you have to run "npm run build" first).

* `localData` Sources the JSONs / splash images etc from /data/ rather than data.nextstrain.org.
This works even if you've built the bundle, as the API calls are handled by the same server.
You probably want this on for development, off for testing before deploying.

* `localStatic` Sources the Static posts (reports) from /static/ rather than github.com/nextstrain/nextstrain.org.
This works even if you've built the bundle, as the API calls are handled by the same server.
You probably want this on for development, off for testing before deploying.
