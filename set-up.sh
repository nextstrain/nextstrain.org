#!/usr/bin/env bash

echo "Running the nextstrain.org set up script"

function errorFound {
  echo -e "\nScript Failed at step $step (Line $1)\nYou are responsible for clean up (sorry!)"
  exit 2
}
# TRAPS
trap 'errorFound $LINENO' ERR

##############################################################
echo "Step 1: Obtaining (pre-compiled) static website files from S3"
curl https://s3.amazonaws.com/nextstrain-bundles/static.tar.gz --output static.tar.gz

echo -e "\tUncompressing static"
if [ -d "static" ]; then
  rm -rf static
fi
mkdir static
tar -xzvf static.tar.gz -C static/
rm static.tar.gz

##############################################################
echo "Step 2: Building a customised version of auspice"

echo -e "\tInstalling auspice from source as the extend version is not yet in master and therefore not on NPM"
mkdir scratch           # we already have an auspice directory!
cd scratch
git clone https://github.com/nextstrain/auspice.git
cd auspice
git checkout extend
npm install             # install dependencies
npm install --only=dev  # needed for heroku
npm install -g .        # make "auspice" available globally
cd ../..
auspice -h              # ensure auspice is available

echo -e "\tBuilding auspice with nextstrain.org extensions (for the client)"
cd auspice
auspice build --verbose --extend ./client/config.json
cd ..

echo "Set up complete. Next step: \"npm run server\""