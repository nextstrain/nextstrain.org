[![CI status](https://github.com/nextstrain/nextstrain.org/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/nextstrain/nextstrain.org/actions/workflows/ci.yml)

# Nextstrain.org

Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data alongside powerful analytic and visualization tools for use by the community. Our goal is to aid epidemiological understanding and improve outbreak response.
If you have any questions, or simply want to say hi, please give us a shout at hello@nextstrain.org or introduce yourself at [discussion.nextstrain.org](https://discussion.nextstrain.org). We welcome contributions to Nextstrain; see our [contributing documentation](https://docs.nextstrain.org/en/latest/guides/contribute/) to learn more.

This repo comprises:
  1. A server (`./server.js`) which serves all the content on [nextstrain.org](https://nextstrain.org), handles authentication and responds to API requests.
  1. The [frontend pages](#Splash--documentation-pages), located in the `./static-site` directory.
  1. Code to build a customised version of the [Auspice](#Auspice) client, which is located in the `./auspice-client` directory.

This repository provides the tools you need to [build nextstrain.org locally](#build-nextstrainorg-locally) and [deploy nextstrain.org](#deploy-nextstrainorg).

---
## Build nextstrain.org locally

### 1. Set up an environment with the correct version of Node.js/NPM

Check [package.json](./package.json) for the supported versions, e.g.

```json
"engines": {
  "node": "^20",
  "npm": "^10"
}
```

While other versions may build this project successfully, we recommend using the supported versions to align with the Heroku environments.

If you are using another version for other projects, you can switch between different versions using tools such as `nvm` or `conda`; an `.nvmrc` file targetting the supported Node version is present, so `nvm install` will ensure you're using the correct version.

### 2. Install prerequisites
Install the node dependencies by running
```
npm ci
```
from this directory (the "nextstrain.org" directory).

> Using `npm ci` instead of `npm install` ensures your dependency tree matches those in `package-lock.json`.


### 3. Build the site
`npm run build` runs `./build.sh` to build both the static site & an Auspice client with customisations.
The following section details the different ways to serve these pages on a local server after building the site.

### 4. Run server

#### Run server mirroring the deployed (live) website
`npm run server` will start a local server, by default available at [localhost:5000](http://localhost:5000).
This should mirror exactly what you see when you visit [nextstrain.org](https://nextstrain.org).
In order to replicate the live behavior, you will need the appropriate environment variables set (see below).

#### Run server in development mode
If you are developing on nextstrain.org there are a few recommended paths depending on your aim:

For most cases running `npm run dev` should do what you want.
It will both watch for any changes to the server code (`./src`) and restart the server when you update the code, and also watch for any changes to the next.js frontend code (`./static-site`) and use hot-reloading to update the site as you make changes.

If you are only making changes to the server code or want to test the compiled frontend site you can run `npm run dev:ssg`.
This will still restart the server if you modify server code but it will not update if you change any code in `./static-site`.
This also allows testing the next.js frontend code as it would appear in the live site.


### Environment variables

See [docs/infrastructure.md](https://github.com/nextstrain/nextstrain.org/blob/master/docs/infrastructure.md#environment-variables) for a description of the environment variables used by the server.
For running locally, you should ensure
  - `NODE_ENV` is not set to "production", as authentication will not work on localhost.
  - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are a valid [AWS IAM](https://aws.amazon.com/iam/) user, in order for the server to access S3 buckets.
  Alternatively, these may be configured using `~/.aws/credentials`.
  If you add a new profile to `~/.aws/credentials`, you can then tell the server to use it by setting `AWS_PROFILE=...`.

If you have built the next.js part of the site (`./static-site`), via `npx next build static-site` or similar, then setting `USE_PREBUILT_STATIC_SITE=1` will use these built assets rather than server-side compilation.

Use `DEBUG` to control debug-level logging output.
In particular, setting `DEBUG=nextstrain:*` is useful to see all output from our own codebase.

---

## Frontend pages other than Auspice

All of the frontend (client) pages in nextstrain.org except for those using Auspice to visualise datasets are built using [Next.JS](https://nextjs.org) and found in `./static-site/`.

See [static-site/README.md](./static-site/README.md) for instructions on how to add content.
See above for how to run the server in development mode which will allow you to develop these pages.

In production, these are compiled (`npm run build`) and served via the nextstrain.org server (`npm run server`).

---
## Documentation

Nextstrain documentation is hosted by Read The Docs at [docs.nextstrain.org](https://docs.nextstrain.org).
Please see [this GitHub repo](https://github.com/nextstrain/docs.nextstrain.org/) for more details.

> Note that the documentation used to be served from the server in this repo at URLs such as nextstrain.org/docs/... until [November 2020](https://github.com/nextstrain/nextstrain.org/pull/226).
A number of [redirects](./src/redirects.js) have been added to preserve old URLs.

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
npx auspice develop --verbose --extend ./customisations/config.json --handlers ../src/endpoints/charon/index.js
```

> If you're not familiar with [`npx`](https://www.npmjs.com/package/npx), it's a command to easily run programs installed by `npm`.
> Running `npx auspice` above is equivalent to `node_modules/.bin/auspice`.


### Using a different version of Auspice
Sometimes it is useful to change the version of Auspice that is used.
Perhaps you're upgrading the version nextstrain.org uses or you want to test changes in a local copy of Auspice against nextstrain.org.

If you're upgrading the version of Auspice used, install the new version with:

```bash
cd auspice-client
npm install auspice@...
```

Replace `...` with the [semantic version specifier](https://docs.npmjs.com/about-semantic-versioning) you want.
This will change `package.json` and `package-lock.json` (in `auspice-client/`) to reflect the new version you installed.
When preparing to commit your Auspice version change, you'll want to include those changed files too.
Run `npx auspice --version` (in `auspice-client/`) to check that (a) it's installed correctly and (b) which version you have.

Then build and run the server from the repository root as above with either:

```bash
./build.sh auspice
npm run server
```

or

```bash
cd auspice-client
npx auspice develop --verbose --extend ./customisations/config.json --handlers ../src/endpoints/charon/index.js
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
and as long as there is a server and the response is appropriate then the auspice client can visualise the data.


The nextstrain.org server (`server.js`) sets up GET request handlers for those three endpoints using code imported from `./src/endpoints/charon/index.js`.


The code for these handlers, which is exposed by `./src/endpoints/charon/index.js`, has been written in such a way that it can be imported by:
1. The nextstrain.org server: `npm run server` (see `server.js`)
2. The auspice server: `cd auspice-client && npx auspice view --handlers ../src/endpoints/charon/index.js --verbose` (rarely useful in this case, make sure you've run `npm run build -- auspice` first!)
3. The auspice development server: `npx auspice develop --handlers ./src/endpoints/charon/index.js --verbose --extend ./auspice-client/customisations/config.json` (useful for auspice development, note the client customisations applied here too!)

> Note that 2 and 3 are running the auspice server locally but modifying it via functionality whereby the default request handlers (for `/charon/...` GET requests) can be overwritten by command line arguments.
In this case, they're overwriting them with the handlers used by the nextstrain.org server (see `server.js`) and thus the auspice server mimics the nextstrain.org server behavior (fetching datasets from S3, etc.).
See the [auspice API documentation](https://nextstrain.github.io/auspice/server/api) for more info.


---

## Deployments

See the [infrastructure documentation](./docs/infrastructure.md) for details.


---
## Testing
Nextstrain.org currently uses limited automated testing defined in `test/*.test.js` files.
Run the tests with:

    npm run test:ci

This will run a local server for the duration of the tests.
Alternatively, you can run your own server in the background and run:

    npm run test

instead.

To run a single test or small number of test files, run a local server and invoke Jest directly, for example:

    NODE_OPTIONS='--experimental-vm-modules' npx jest --run-tests-by-path test/routing.test.js

---

<p align="center">
  <img src="/docs/images/fred-hutch-logo-small.png" width="75" />
  <img src="/docs/images/max-planck-logo-small.png" width="65" />
  <img src="/docs/images/nih-logo-small.png" width="52" />
  <img src="/docs/images/erc-logo-small.png" width="60" />
  <img src="/docs/images/osp-logo-small.png" width="82" />
  <img src="/docs/images/bz_logo.png" width="85" />
</p>
