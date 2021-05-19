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

### 1. Install prerequisites
Install the node dependencies by running
```
npm ci
```
from this directory (the "nextstrain.org" directory).

> Using `npm ci` instead of `npm install` ensures your dependency tree matches those in `package-lock.json`.


### 2. Build the site
`npm run build` runs `./build.sh` to build both the static site & an auspice client with customisations.
The following section details the different ways to serve these pages on a local server after building the site.

### 3. Run server

#### Run server mirroring the deployed (live) website
`npm run server` will start a local server, by default available at [localhost:5000](http://localhost:5000).
This should mirror exactly what you see when you visit [nextstrain.org](https://nextstrain.org).
In order to replicate the live behavior, you will need the appropriate environment variables set (see below).

#### Run server in development mode
If you are developing on nextstrain.org, we recommend running:

`npm run dev` , which runs `./develop.sh` to launch a development server of nextstrain.org, by default available at [localhost:8000](http://localhost:8000).
Changes to files in `./static-site` will be reflected in the corresponding pages on the development server without needing to refresh.

This works by running the main nextstrain server on port 5000 and then running the Gatsby (see below for more on Gatsby) server on port 8000 and directing requests outside of Gatsby to port 5000.
See [nextstrain.org/pull/280](https://github.com/nextstrain/nextstrain.org/pull/280) for more on this.

An alternative approach is to build the site (as above) and then start the server:
```sh
NODE_ENV="dev" npm run server
```

### Environment variables

See [docs/infrastructure.md](https://github.com/nextstrain/nextstrain.org/blob/master/docs/infrastructure.md#environment-variables) for a description of the environment variables used by the server.
For running locally, you should ensure
  - `NODE_ENV` is not set to "production", as authentication will not work on localhost.
  - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are a valid AWS IAM user, in order for the server to access S3 buckets.
  Alternatively, these may be configured using `~/.aws/credentials`.
  If you add a new profile to `~/.aws/credentials`, you can then tell the server to use it by setting `AWS_PROFILE=...`.


---

## Splash page (and other misc pages)
There are a number of pages built using Gatsby and found in `./static-site/`.
See [static-site/README.md](./static-site/README.md) for instructions on how to add content and develop this portion of the site in isolation.
In production, these are compiled (`npm run build`) and served via the nextstrain.org server (`npm run server`).

---
## Documentation

Nextstrain documentation is hosted by Read The Docs at [docs.nextstrain.org](https://docs.nextstrain.org).
Please see [this GitHub repo](https://github.com/nextstrain/docs.nextstrain.org/) for more details.

> Note that the documentation used to be served from the server in this repo at URLs such as nextstrain.org/docs/... until [November 2020](https://github.com/nextstrain/nextstrain.org/pull/226).
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

## Deployments

See the (infrastructure documentation)[./docs/infrastructure.md) for details.


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
