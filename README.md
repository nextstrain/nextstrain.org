Current (master branch) travis status:[![Build Status](https://travis-ci.com/nextstrain/nextstrain.org.svg?branch=master)](https://travis-ci.com/nextstrain/nextstrain.org)

# Nextstrain.org

Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data alongside powerful analytic and visualization tools for use by the community. Our goal is to aid epidemiological understanding and improve outbreak response. If you have any questions, or simply want to say hi, please give us a shout at hello@nextstrain.org.


This repo builds [nextstrain.org](https://nextstrain.org) and comprises:
  1. The [splash & documentation pages](#Splash--documentation-pages), which are built using Gatsby
  2. Customisations for [Auspice](#Auspice)
  3. [Server](#Server) which, amongst other things, handles auspice data JSONs

This repository provides the tools you need to [build nextstrain.org locally](#build-nextstrainorg-locally) and [deploy nextstrain.org](#deploy-nextstrainorg).

---
## Splash & documentation pages

This is found at `./static-site/`.
See [static-site/README.md](./static-site/README.md) for instructions on how to add documentation and develop.
This is built using Gatsby during deployment and served via `./server.js`.

---
## Auspice
[Auspice](https://github.com/nextstrain/auspice) is the web-facing (e.g. "client") software used to visualise & interact with phylogenomic data.

### Auspice client customisations
The auspice customisations specific to nextstrain.org are found in `./auspice/client/`.
Please see [the auspice documentation](https://nextstrain.github.io/auspice/customisations/introduction) for more information.

### Testing locally:

Production mode:
```bash
./build.sh auspice
npm run server
```
This will create the `auspice/index.html` and `auspice/dist/*` files which are gitignored.
Note that the favicon.png isn't needed for auspice, as the nextstrain.org server handles this.

Development mode:
```bash
cd auspice
npx auspice develop --verbose --extend ./client/config.json --handlers ./server/index.js
```
Note that the auspice development mode uses the auspice splash page which won't be shown in production.
This is because the nextstrain.org server (see above) uses the splash page of the static content, but the auspice dev server doesn't.
The advantage of development mode is that the client will live update as you edit the customisations.

---
## Server
Auspice is a flexible tool created for visualising phylogenomic data that are not specific to any domain.
Therefore, auspice installations do not come with any pre-packaged data.
Auspice requires interaction with a server to send and receive data.
The [auspice repo on GitHub](http://github.com/nextstrain/auspice) contains a NodeJS backend that serves the bundled auspice JavaScript file to the server and also provides web API endpoints (prefixed with '`/charon/`).
The auspice front-end (e.g. "client") is server-agnostic.

Currently, the auspice backend (e.g. "server") is not implemented in an importable or flexible way that allows usage across servers.
This means that nextstrain.org, auspice.us, and your local auspice installation all use independent servers. They all serve the auspice client JavaScript code and listen for GET requests at `/charon/...`, but they are implemented differently.

[./server.js](server.js) decides, based on the path, whether to serve the bundled auspice JavaScript file (built from running `auspice build`), the (pre-built) static [splash & documentation pages](#Splash--documentation-pages), or the auspice-specific code from `./auspice/server` to process auspice requests for data from the `/charon/...` web API endpoints (including data transforms).

---

## Build nextstrain.org locally

### Install prerequisites

We recommend using a conda environment to manade the dependencies as both node version 10 and python v2 are needed.
These can be installed into a new environment via:
```
conda create -n nextstrain.org nodejs=10 python=2.7
```
Next we need to install the node dependencies by running
```
npm install
```
from this directory (the "nextstrain.org" directory).


### Build locally mirroring the deployed (live) website
1. `npm run build`, which runs `./build.sh` to build both the static site & auspice with nextstrain.org customisations.
2. `npm run server` will then start a local instance, by default available at [localhost:5000](http://localhost:5000).
This should mirror exactly what you see when you visit [nextstrain.org](https://nextstrain.org).


### Build locally using a custom version of auspice
When nextstrain.org is built, it uses `auspice build` to generate a client (see [above section](#Auspice)), using the version of `auspice` installed when we ran `npm install` above.
If you'd instead like to use a custom version of auspice (e.g. if you are concurrently developing the auspice source code) then _do not_ run `npm run build`, instead
1. Install auspice globally from source -- [docs here](https://nextstrain.org/docs/getting-started/local-installation/#install-auspice-from-source)
2. Generate the client using this globally installed `auspice` via:
```
cd auspice/
auspice build --verbose --extend ./client/config.json
cd -
```
3. Start the nextstrain.org server as per normal (`npm run server --verbose`)

> Note: You cannot run `auspice view` or `auspice develop` (with hot reloading) to serve the entire nextstrain.org server, which comprises both the static-site and auspice.


#### How does this work?
The [code that handles `/charon/...` requests](auspice/server/index.js) has been written in such that the code can be imported by
1. the nextstrain.org server
2. `auspice view --handlers ./auspice/server/index.js`
3. `auspice develop --handlers ./auspice/server/index.js`

Note that 2 and 3 are running auspice locally but overwriting the (default) auspice handlers for `/charon/...` GET requests.
In this case, they're overwriting them with the handlers used in the nextstrain.org repo and are employing the nextstrain.org behavior (fetching datasets from S3, etc.).
See the [charon API auspice documentation](https://nextstrain.github.io/auspice/customisations/server/charonAPI) for more info.

---
## Deploy nextstrain.org
All commits pushed to github trigger [Travis-CI](https://travis-ci.com/nextstrain/nextstrain.org), which runs the `npm run build` script.
If there are no errors, and we're on the master branch, Travis-CI then triggers the heroku server to rebuild (via `npm run redeploy-site`).
Heroku rebuilds by running `npm run build` and, upon success, starts the server (`npm run server`).


Note that there is a development heroku server available which can be deployed via
`git push -f heroku-dev <branch>:master`, where the `heroku-dev` remote is https://git.heroku.com/nextstrain-dev.git
It can be useful to test an unpublished auspice version -- `npm install` the version you want, commit the changes, and push to `heroku-dev` (see comments in that file for further info).


---

<p align="center">
  <img src="/docs/images/fred-hutch-logo-small.png" width="75" />
  <img src="/docs/images/max-planck-logo-small.png" width="65" />
  <img src="/docs/images/nih-logo-small.png" width="52" />
  <img src="/docs/images/erc-logo-small.png" width="60" />
  <img src="/docs/images/osp-logo-small.png" width="82" />
  <img src="/docs/images/bz_logo.png" width="85" />
</p>
