Current (master branch) travis status:[![Build Status](https://travis-ci.com/nextstrain/nextstrain.org.svg?branch=master)](https://travis-ci.com/nextstrain/nextstrain.org)

# Nextstrain.org

Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data alongside powerful analytic and visualization tools for use by the community. Our goal is to aid epidemiological understanding and improve outbreak response.
If you have any questions, or simply want to say hi, please give us a shout at hello@nextstrain.org or introduce yourself at [discussion.nextstrain.org](https://discussion.nextstrain.org).

> We have received a number of generous offers to contribute front-end developer effort to nextstrain (and auspice) folowing our work on [SARS-CoV-2](https://nextstrain.org/ncov).
We would be grateful for code contributions, as well as constructive criticism and advice.
A list of potential issues is being actively maintained at https://github.com/orgs/nextstrain/projects/5.


This repo comprises:
  1. A server (`./server.js`) which serves all the content on [nextstrain.org](https://nextstrain.org), handles authentication and responds to API requests.
  1. The [splash & documentation pages](#Splash--documentation-pages), which are built using Gatsby & located in the `./static-site` directory.
  1. Code to build a customised version of the [Auspice](#Auspice) client, which is located in the `./auspice-client` directory.

This repository provides the tools you need to [build nextstrain.org locally](#build-nextstrainorg-locally) and [deploy nextstrain.org](#deploy-nextstrainorg).

---
## Build nextstrain.org locally

### Install prerequisites
Install the node dependencies by running
```
npm ci
```
from this directory (the "nextstrain.org" directory).

> Using `npm ci` instead of `npm install` ensures your dependency tree matches those in `package-lock.json`.


### Build locally mirroring the deployed (live) website
1. `npm run build`, which runs `./build.sh` to build both the static site & an auspice client with customisations.
2. `npm run server` will then start a local instance, by default available at [localhost:5000](http://localhost:5000).
This should mirror exactly what you see when you visit [nextstrain.org](https://nextstrain.org).

#### Building with Nextstrain Groups (e.g. "Login") functionality
You'll need AWS credentials configured (via environment or `~/.aws/credentials`) for the Bedford Lab account.
If you add a new profile to `~/.aws/credentials`, you can then tell the local nextstrain.org server to use it by setting `AWS_PROFILE=...`.

---

## Splash page (and other misc pages)
There are a number of pages built using Gatsby and found in `./static-site/`.
See [static-site/README.md](./static-site/README.md) for instructions on how to add content and develop this portion of the site in isolation.
In production, these are compiled (`npm run build`) and served via the nextstrain.org server (`npm run server`).

---
## Documentation

Nextstrain documentation is hosted by Read The Docs at [docs.nextstrain.org](https://docs.nextstrain.org).
Please see [this GitHub repo](https://github.com/nextstrain/docs.nextstrain.org/) for more details.

> Note that the documentation used to be served from the server in this repo at URLs such as nextstain.org/docs/... until [November 2020](https://github.com/nextstrain/nextstrain.org/pull/226).
A number of [redirects](./redirects.js) have been added to preserve old URLs.

---
## Auspice client
We use [Auspice](https://github.com/nextstrain/auspice) to visualise & interact with phylogenomic data.

### A customised version of the Auspice client
We build a customised version of the auspice client (e.g. the part you see in the browser) for nextstrain.org.
The auspice customisations specific to nextstrain.org are found in `./auspice-client/customisations/`.
Please see [the auspice documentation](https://nextstrain.github.io/auspice/customise-client/introduction) for more information on customising auspice.

### Testing locally
Make sure you've installed dependencies with `npm ci` first (and activated your conda environment if using one).

If you have AWS credentials make sure they are set as environment variables (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`).
These are not necessary, but some functionality will be missing if these aren't available.

Then run:

```bash
./build.sh auspice
npm run server
```
This will create the `auspice-client/index.html` and `auspice-client/dist/*` files which are gitignored.
Note that the favicon.png isn't needed for auspice, as the nextstrain.org server handles this.

You can also run Auspice's own development server (not the nextstrain.org server) to ease development of client customizations.
This means that you will see a different splash page & the documentation will not work.
It is not currently possible to run auspice in development mode & see the nextstrain.org splash page & docs.
Read the section below on the nextstrain.org server for more context.

```bash
cd auspice-client
npx auspice develop --verbose --extend ./customisations/config.json --handlers ../src/index.js
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
cd auspice-client
npx auspice develop --verbose --extend ./customisations/config.json --handlers ../src/index.js
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
* the (pre-built) static [splash & documentation pages](#splash--documentation-pages)


#### Aside: How do auspice (client) - server communications work?
Auspice is a flexible tool created for visualising phylogenomic data that are not specific to any domain.
It can make the following API requests to a server:
* `/charon/getAvailable`
* `/charon/getNarrative`
* `/charon/getDataset`
and as long as there is a server and the reponse is appropriate then the auspice client can visualise the data.


The nextstrain.org server (`server.js`) sets up GET request handlers for those three endpoints using code imported from `./src/index.js`.


The code for these handlers, which is exposed by `./src/index.js`, has been written in such a way that it can be imported by:
1. The nextstrain.org server: `npm run server` (see `server.js`)
2. The auspice server: `cd auspice-client && npx auspice view --handlers ../src/index.js --verbose` (rarely useful in this case, make sure you've run `npm run build -- auspice` first!)
3. The auspice development server: `npx auspice develop --handlers ./src/index.js --verbose --extend ./auspice-client/customisations/config.json` (useful for auspice development, note the client customisations applied here too!)

> Note that 2 and 3 are running the auspice server locally but modifying it via functionality whereby the default request handlers (for `/charon/...` GET requests) can be overwritten by command line arguments.
In this case, they're overwriting them with the handlers used by the nextstrain.org server (see `server.js`) and thus the auspice server mimics the nextstrain.org server behavior (fetching datasets from S3, etc.).
See the [auspice API documentation](https://nextstrain.github.io/auspice/server/api) for more info.


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
## Testing
Nextstrain.org currently implements limited smoke-testing to test requests originiating from the Auspice client to the nextstrain.org server (i.e. API GET requests starting with `/charon/`).
These are defined [in this JSON file](./test/smoke-test/auspice_client_requests.json) and can be run via

```
npm run test:ci
```

Which will run a local server for the duration of the tests.
Alternatively, you can run your own server in the background and run `npm run smoke-test`.

---

<p align="center">
  <img src="/docs/images/fred-hutch-logo-small.png" width="75" />
  <img src="/docs/images/max-planck-logo-small.png" width="65" />
  <img src="/docs/images/nih-logo-small.png" width="52" />
  <img src="/docs/images/erc-logo-small.png" width="60" />
  <img src="/docs/images/osp-logo-small.png" width="82" />
  <img src="/docs/images/bz_logo.png" width="85" />
</p>
