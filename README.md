Current (master branch) travis status:[![Build Status](https://travis-ci.com/nextstrain/nextstrain.org.svg?branch=master)](https://travis-ci.com/nextstrain/nextstrain.org)

# Nextstrain.org

Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data alongside powerful analytic and visualization tools for use by the community. Our goal is to aid epidemiological understanding and improve outbreak response. If you have any questions, or simply want to say hi, please give us a shout at hello@nextstrain.org.


This repo comprises:
  1. A server (`./server.js`) which serves all the content on [nextstrain.org](https://nextstrain.org) & handles authentication.
  1. The [splash & documentation pages](#Splash--documentation-pages), which are built using Gatsby & located in the `./static-site` directory.
  1. Code to build a customised version of the [Auspice](#Auspice) client, which is located in the `./auspice/client` directory.

This repository provides the tools you need to [build nextstrain.org locally](#build-nextstrainorg-locally) and [deploy nextstrain.org](#deploy-nextstrainorg).

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
1. `npm run build`, which runs `./build.sh` to build both the static site & an auspice client with customisations.
2. `npm run server` will then start a local instance, by default available at [localhost:5000](http://localhost:5000).
This should mirror exactly what you see when you visit [nextstrain.org](https://nextstrain.org).

#### Building with Nextstrain Groups (e.g. "Login") functionality
You'll need AWS credentials configured (via environment or `~/.aws/credentials`) for the Bedford Lab account.
If you add a new profile to `~/.aws/credentials`, you can then tell the local nextstrain.org server to use it by setting `AWS_PROFILE=...`.

---
## Splash & documentation pages

These are found in `./static-site/`.
See [static-site/README.md](./static-site/README.md) for instructions on how to add content (e.g. docs) and develop this portion of the site in isolation.
In production, this is built using Gatsby (`npm run build`) and served via the nextstrain.org server (`npm run server`).


---
## Auspice client
We use [Auspice](https://github.com/nextstrain/auspice) to visualise & interact with phylogenomic data.

### A customised version of the Auspice client
We build a customised version of the auspice client (e.g. the part you see in the browser) for nextstrain.org.
The auspice customisations specific to nextstrain.org are found in `./auspice/client/`.
Please see [the auspice documentation](https://nextstrain.github.io/auspice/customisations/introduction) for more information on customising auspice.

### Testing locally

Make sure you've installed dependencies with `npm install` first (and activated your conda environment if using one).
Then run:

```bash
./build.sh auspice
npm run server
```
This will create the `auspice/index.html` and `auspice/dist/*` files which are gitignored.
Note that the favicon.png isn't needed for auspice, as the nextstrain.org server handles this.

You can also run Auspice's own development server (not the nextstrain.org server) to ease development of client customizations.
This means that you will see a different splash page & the documentation will not work.
It is not currently possible to run auspice in development mode & see the nextstrain.org splash page & docs.
Read the section below on the nextstrain.org server for more context.

```bash
cd auspice
npx auspice develop --verbose --extend ./client/config.json --handlers ./server/index.js
```

> If you're not familiar with [`npx`](https://www.npmjs.com/package/npx), it's a command to easily run programs installed by `npm`.
> Running `npx auspice` above is equivalent to `../node_modules/.bin/auspice`.


### Using a different version of Auspice

Sometimes it is useful to change the version of Auspice that is used.
Perhaps you're upgrading the version nextstrain.org uses or you want to test changes in a local copy of Auspice against nextstrain.org.

If you're upgrading the version of Auspice used, install the new version with `npm install auspice@...`.
Replace `...` with the [semantic version specifier](https://docs.npmjs.com/about-semantic-versioning) you want.
This will change `package.json` and `package-lock.json` to reflect the new version you installed.
When preparing to commit your Auspice version change, you'll want to include those changed files too.
Run `npx auspice --version` to check that (a) it's installed correctly and (b) which version you have.

Then build and run the server as above with either:

```bash
./build.sh auspice
npm run server
```

or

```bash
cd auspice
npx auspice develop --verbose --extend ./client/config.json --handlers ./server/index.js
```

If you're installing from a local development copy of Auspice's source, you can use [`npm link`](https://docs.npmjs.com/cli/link) to use your local copy without the need to continually re-install it after every change:

```bash
npm link <path to auspice repo>
npm link <path to auspice repo>/node_modules/react
```

This uses symlinks both globally and within the local `node_modules/` directory to point the local Auspice dependency to your local Auspice source.

> Using `npm install <path to auspice repo>` will _not_ work to use a local development copy, as dependencies are handled differently with `npm install` vs. `npm link` in this case.

---
## Nextstrain.org server
`npm run server` runs `./server.js` which serves all the content on [nextstrain.org](https://nextstrain.org) & handles authentication.

This server decides based on the path, whether to serve:
* the bundled auspice JavaScript file (i.e. the auspice client, built above via `./build.sh auspice`) _or_
* the (pre-built) static [splash & documentation pages](#Splash--documentation-pages


#### Aside: How do auspice (client) - server communications work?
Auspice is a flexible tool created for visualising phylogenomic data that are not specific to any domain.
It can make the following API requests to a server:
* `/charon/getAvailable`
* `/charon/getNarrative`
* `/charon/getDataset`
and as long as there is a server and the reponse is appropriate then the auspice client can visualise the data.


The nextstrain.org server (`server.js`) sets up GET request handlers for those three endpoints.
The code to handle these requests is imported from `./auspice/server/index.js`.


These handlers have been written in such a way that they can be imported by:
1. the nextstrain.org server (`server.js`, run via `npm run server`)
2. `auspice view --handlers ./auspice/server/index.js` (rarely useful in this case)
3. `auspice develop --handlers ./auspice/server/index.js` (useful for auspice development)

> Note that 2 and 3 are running auspice locally but overwriting the (default) auspice handlers for `/charon/...` GET requests.
In this case, they're overwriting them with the handlers used in the nextstrain.org repo and are employing the nextstrain.org behavior (fetching datasets from S3, etc.).
See the [charon API auspice documentation](https://nextstrain.github.io/auspice/customisations/server/charonAPI) for more info.



---
## Deploy nextstrain.org
All commits pushed to github trigger [Travis-CI](https://travis-ci.com/nextstrain/nextstrain.org), which runs the `npm run build` script & runs [eslint](https://eslint.org/) via `npm run lint`.
Heroku will deploy commits pushed to the `master` branch automatically if there are no Travis CI errors.
Heroku builds by running `npm run build` and, upon success, starts the server (`npm run server`).


---
## Deploy the development nextstrain.org server
There is a [development heroku server](https://nextstrain-dev.herokuapp.com/) available which can be deployed via
`git push -f heroku-dev <branch>:master`, where the `heroku-dev` remote is https://git.heroku.com/nextstrain-dev.git.
It can be useful to test an unpublished auspice version -- modify `build.sh` to install the version of auspice you want (see comments in that file), commit the changes, and push to `heroku-dev`.


---

<p align="center">
  <img src="/docs/images/fred-hutch-logo-small.png" width="75" />
  <img src="/docs/images/max-planck-logo-small.png" width="65" />
  <img src="/docs/images/nih-logo-small.png" width="52" />
  <img src="/docs/images/erc-logo-small.png" width="60" />
  <img src="/docs/images/osp-logo-small.png" width="82" />
  <img src="/docs/images/bz_logo.png" width="85" />
</p>
