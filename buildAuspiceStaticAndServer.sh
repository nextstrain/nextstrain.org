#!/usr/bin/env bash

echo "Running the nextstrain.org bash build script"

function errorFound {
  echo -e "\nScript Failed at step $step (Line $1)\nYou are responsible for clean up (sorry!)"
  exit 2
}
# TRAPS
trap 'errorFound $LINENO' ERR

####################################
# Prior to this script, heroku will have run npm install to grab node_modules
# This script will grab (from github) auspice + the static site, and build them
# Finally it will build the server (which relies on a few files in auspice)
#
#
# It *should* work on your own computer, but the PATH is really tricky on heroku
# so it may not... (just comment out the lines where we change the path for a local build?!?!)
#
#
####################################


# STEP 1: AUSPICE
echo "Cloning Auspice (branch: no-static) repo"
git clone -b prerelease --single-branch https://github.com/nextstrain/auspice.git

echo "Jumping into Auspice"
cd auspice

echo "HACKING PATH"
OLD_PATH=$PATH
export PATH=`echo ${PATH} | awk -v RS=: -v ORS=: '/node_modules\/.bin/ {next} {print}'`
# echo "Old Path: ${OLD_PATH}"
# echo "New Path: ${PATH}"

echo "Installing auspice dependencies from npm"
NODE_ENV=development # necessary to pull in dev dependencies
npm install
NODE_ENV=production

echo "Building auspice (npm run build)"
npm run build

echo "Jumping back to parent directory & resetting PATH"
cd ..
export PATH=${OLD_PATH}

echo "Cloning the static site"
git clone -b master --single-branch https://github.com/nextstrain/static.git

echo "Jumping into the static site"
cd static

echo "Installing static dependencies from npm"
npm install

echo "Building static site with Gatsby"
npm run build

echo "Building the server"
cd ..
rm auspice/.babelrc # why? you get errors because or node_module pathing and babelrc defined plugins. I don't understand why /auspice/.babelrc is even being looked at!
npm run buildServerOnly

echo "DONE :) Now the Procfile will run the server (via 'npm run server')"
