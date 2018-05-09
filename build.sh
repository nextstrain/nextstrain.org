#!/usr/bin/env bash

echo "Running the nextstrain.org bash build script"

function errorFound {
  echo -e "\nScript Failed at step $step (Line $1)\nYou are responsible for clean up (sorry!)"
  exit 2
}
# TRAPS
trap 'errorFound $LINENO' ERR


# Heroku installs the npm libs for this directory only
# https://devcenter.heroku.com/articles/nodejs-support

echo "Cloning Auspice (branch: server-tidyup) & Static site repos"
git clone -b server-tidyup --single-branch https://github.com/nextstrain/auspice.git
git clone -b master --single-branch https://github.com/nextstrain/nextstrain.org.git

echo "Jumping into Auspice"
cd auspice

echo "installing from npm"
npm install

echo "building auspice (npm run postinstall)"
npm run postinstall

echo "Jumping into the Static site"
cd ../nextstrain.org

echo "installing from npm"
npm install

echo "building gatsby"
npm run build

echo "building the server"
cd ..
npm run build

echo "DONE :) Now the Procfile will run the server"
