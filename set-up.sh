#!/usr/bin/env bash

function errorFound {
  echo -e "\nScript Failed at step $step (Line $1)\nYou are responsible for clean up (sorry!)"
  exit 2
}
# TRAPS
trap 'errorFound $LINENO' ERR

##############################################################
echo "Running the nextstrain.org set up script"


##############################################################
echo "Step 1: Building the static site (./static-site/public/)"
cd static-site
npm install # this needs python 2
npm run build # build using gatsby. Can take a few minutes.
cd ..

##############################################################
echo "Step 2a: Installing auspice (globally)"
npm install --global auspice@1.36.2

# for testing reasons (e.g. deploying to dev-heroku server) you may wish to
# install from a github branch (useful for auspice versions not pushed to npm)
# npm install --global https://github.com/nextstrain/auspice/tarball/master


echo "Step 2b: Building a customised version of auspice"
cd auspice
auspice build --verbose --extend ./client/config.json
cd ..

##############################################################
echo "Set up complete. Next step: \"npm run server\""
