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

if command -v auspice; then
  echo -e "\tGlobally installed auspice found at $(command -v auspice)"
else
  echo -e "\tInstalling auspice from source as the extend version is not yet in master and therefore not on NPM"
  # installing auspice into the gitignored scratch directory as the directory "auspice" already exists
  if [ ! -d "scratch" ]; then
    mkdir scratch
  fi
  cd scratch
  if [ ! -d "auspice" ]; then
    git clone https://github.com/nextstrain/auspice.git
  fi
  cd auspice
  git checkout extend     # remove after auspice PR #688 is merged
  npm install             # install dependencies
  npm install --only=dev  # needed for heroku
  npm install -g .        # make "auspice" available globally
  cd ../..
  auspice --version       # ensure auspice is available
fi

echo -e "\tBuilding auspice with nextstrain.org extensions (for the client)"
cd auspice
auspice build --verbose --extend ./client/config.json
cd ..

##############################################################
echo "Set up complete. Next step: \"npm run server\""