# Visualisation of model outputs

> _This is a work in progress!_

### Installation

* Everything should happen from the `viz` directory (where this file is)

* Create an enviornment with nodeJS and npm, e.g. 
`conda create -n <env-name> -c conda-forge nodejs=18`

```sh
npm install 
npm run start # dev mode
```

### Where are model data sourced from?

By default, the two model data JSONs are fetched from `https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/<MODEL>/latest_results.json`, where `<MODEL>={renewal,mlr}`;
Each of these can be changed via the following environment variables:

* If you wish to use HTTP endpoints, run `REACT_APP_RENEWAL_ENDPOINT="https://..." REACT_APP_MLR_ENDPOINT="https://" npm run start`. Browser-compatible MIME types will be used but note this doesn't yet include zstd.

* If you wish to use a local JSON, provision the files and serve them via a simple server (see below), then use 

```sh
REACT_APP_RENEWAL_ENDPOINT="http://localhost:8000/renewal.json" \
  REACT_APP_MLR_ENDPOINT="http://localhost:8000/mlr.json" \
  npm run start
```

How to make local data available (note that `/data` is gitignored):

```sh
# provision the files
mkdir -p data/
curl --compressed "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/renewal/latest_results.json" --output data/renewal.json
curl --compressed "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/mlr/latest_results.json" --output data/mlr.json
# serve them over localhost:8000
node scripts/data-server.js
```

> Note that we cannot currently use the zstd encodings. There is a library to decompress this in the browser (https://github.com/bokuweb/zstd-wasm) but it requires webpack modifications. For the time being, I've chosen to use gzip encodings. 

### Regenerating the png images in `figures`

`node scripts/static-images.js`

These images are referenced in `./report.md`

### Prior art

* https://github.com/blab/rt-from-frequency-dynamics/tree/master/results/omicron-countries-split
* https://github.com/blab/rt-from-frequency-dynamics/tree/master/results/pango-countries

### Todo

* export a react component we can use in gatsby, or render / serve SVG server-side?
* run on schedule, somewhere, to generate at each model run
* URL inspection to choose model JSON path

