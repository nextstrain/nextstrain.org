Current (master branch) travis status:[![Build Status](https://travis-ci.com/nextstrain/nextstrain.org.svg?branch=master)](https://travis-ci.com/nextstrain/auspice)

# Nextstrain.org

Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data alongside powerful analytic and visualization tools for use by the community. Our goal is to aid epidemiological understanding and improve outbreak response. If you have any questions, or simply want to say hi, please give us a shout at hello@nextstrain.org.

This repo contains the server behind [nextstrain.org](https://nextstrain.org), which serves both the pre-build documentation website & splash page, as well as a customised build of [auspice](github.com/nextstrain/auspice).


### Auspice
Auspice is the software used to visualise & interact with phylogenomic data.
The auspice customisations are located here (`./auspice/client/`), as well as the srver code for handling auspice-derived requests for datasets etcetera (`./auspice/server`).


### Splash & Documentation

The [static documentation website](https://github.com/nextstrain/static) is incorporated into this repo at build time (see below). 
This includes the splash page (nextstrain.org) and the documentation pages (nextstrain.org/docs)
Note that this site is build and uploaded to a S3 bucket whenever it's master branch is updated via it's own [Travis CI config](https://github.com/nextstrain/static/blob/master/.travis.yml).


## Running nextstrain.org locally
The script `npm run set-up` will build nextstrain.org locally.
It carries out these tasks:
1. Fetch the pre-build static site from S3 -- this populates the gitignored `./static/` directory. 
1. Install auspice (as a npm global package)
1. Build auspice -- creates `./auspice/dist/*` and `./auspice/index.html`


To run nextstrain.org locally
1. Run the server: `npm run server` or `npm run server -- --verbose`
1. Nextstrain can now be accessed from [localhost:5000](http://localhost:5000).


## How to build or develop auspice
> Auspice must be installed globally -- check that `auspice -h` works.

To build auspice:
```bash
cd auspice
auspice build --verbose --extend ./client/config.json
cd ..
```
This will create the `auspice/index.html` and `auspice/dist/*` files which are gitignored.
Note that the favicon.png isn't needed for auspice, as the nextstrain.org server handles this.


To develop auspice:
```bash
cd auspice
auspice develop --verbose --extend ./client/config.json --handlers ./server/index.js
```
Note that the auspice development mode uses the auspice splash page which won't be shown in production.
This is because the nextstrain.org server (see above) uses the splash page of the static content, but the auspice dev server doesn't.
The advantage of `auspice develop` mode is that the client will live update as you edit the coustomisations.



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