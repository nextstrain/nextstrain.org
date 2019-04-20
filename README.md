Current (master branch) travis status:[![Build Status](https://travis-ci.com/nextstrain/nextstrain.org.svg?branch=master)](https://travis-ci.com/nextstrain/auspice)

# Nextstrain.org

Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data alongside powerful analytic and visualization tools for use by the community. Our goal is to aid epidemiological understanding and improve outbreak response. If you have any questions, or simply want to say hi, please give us a shout at hello@nextstrain.org.


This repo builds [nextstrain.org](https://nextstrain.org) and comprises:
* The splash page & documentation, which is built using Gatsby
* Customisations for [auspice](github.com/nextstrain/auspice)
* Server which, amongst other things, handles auspice data JSONs



## Splash & Documentation

This is found at `./static-site/`.
See [static-site/README.md](./static-site/README.md) for instructions on how to add documentation and develop.
This is built using Gatsby during deployment (see below) and served via `./server.js`.


## Auspice
Auspice is the software used to visualise & interact with phylogenomic data.
The auspice customisations are found in `./auspice/client/`, with the server code for handling auspice-derived requests for datasets etcetera in `./auspice/server`.
Please see [the auspice documentation](https://nextstrain.github.io/auspice/customisations/introduction) for more information.

#### Testing locally:
> Auspice must be installed globally -- check that `auspice -h` works.

Production mode:
```bash
cd auspice
auspice build --verbose --extend ./client/config.json
cd ..
npm run server
```
This will create the `auspice/index.html` and `auspice/dist/*` files which are gitignored.
Note that the favicon.png isn't needed for auspice, as the nextstrain.org server handles this.

Development mode:
```bash
cd auspice
auspice develop --verbose --extend ./client/config.json --handlers ./server/index.js
```
Note that the auspice development mode uses the auspice splash page which won't be shown in production.
This is because the nextstrain.org server (see above) uses the splash page of the static content, but the auspice dev server doesn't.
The advantage of development mode is that the client will live update as you edit the customisations.

## Server
`./server.js` decides, based on the path, whether to serve auspice or the (pre-built) static documentation / splash pages.
It also imports auspice-specific code from `./auspice/server` to process auspice requests for data (including data transforms).


## Building nextstrain.org locally
The script `npm run set-up` will build the site locally -- see `./set-up.sh` for the exact steps.
Running `npm run server` will then start a local instance, by default available at [localhost:5000](http://localhost:5000).


## Deploy nextstrain.org
All commits pushed to github trigger [Travis-CI](https://travis-ci.com/nextstrain/nextstrain.org), which runs the `npm run set-up` script.
If there are no errors, and we're on the master branch, Travis-CI then triggers the heroku server to rebuild (via `npm run redeploy-site`).
Heroku rebuilds by running `npm run set-up` (via the `heroku-postbuild` hook) and, upon success, starts the server (`npm run server`).


> Note that there is a development heroku server available which can be deployed via
`git push -f heroku-dev <branch>:master`, where the `heroku-dev` remote is https://git.heroku.com/nextstrain-dev.git
It can be useful to test an unpublished auspice version -- modify the `set-up.sh` script locally and push to `heroku-dev` (see comments in that file for further info).


---

<p align="center">
  <img src="/docs/images/fred-hutch-logo-small.png" width="75" />
  <img src="/docs/images/max-planck-logo-small.png" width="65" /> 
  <img src="/docs/images/nih-logo-small.png" width="52" />
  <img src="/docs/images/erc-logo-small.png" width="60" />
  <img src="/docs/images/osp-logo-small.png" width="82" />
  <img src="/docs/images/bz_logo.png" width="85" />
</p>

---