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
echo "Step 2: Building a customised version of auspice"
npm install --global auspice@^1.35.3
cd auspice
auspice build --verbose --extend ./client/config.json
cd ..

##############################################################
echo "Set up complete. Next step: \"npm run server\""
