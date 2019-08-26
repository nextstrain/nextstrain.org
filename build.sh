#!/usr/bin/env bash

function errorFound {
  echo -e "\nScript Failed at step $step (Line $1)\nYou are responsible for clean up (sorry!)"
  exit 2
}
# TRAPS
trap 'errorFound $LINENO' ERR

##############################################################
echo "Running the nextstrain.org build script"


##############################################################
echo "Step 1: Building the static site (./static-site/public/)"
cd static-site
npm install # this needs python 2
npm run build # build using gatsby. Can take a few minutes.
cd ..

##############################################################
# for testing reasons (e.g. deploying to dev-heroku server) you may wish to
# install from a github branch (useful for auspice versions not pushed to npm)
# npm install https://github.com/nextstrain/auspice/tarball/master


echo "Step 2: Building a customised version of auspice"
cd auspice
../node_modules/.bin/auspice build --verbose --extend ./client/config.json
cd ..

##############################################################
echo "Build complete. Next step: \"npm run server\""
