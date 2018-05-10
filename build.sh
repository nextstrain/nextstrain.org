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

echo "Cloning Auspice (branch: no-static) & Static site repos"
git clone -b no-static --single-branch https://github.com/nextstrain/auspice.git
git clone -b master --single-branch https://github.com/nextstrain/nextstrain.org.git

# Building Auspice is a nightmare.

echo "Jumping into Auspice"
cd auspice

echo "HACKING PATH"
OLD_PATH=$PATH
export PATH=`echo ${PATH} | awk -v RS=: -v ORS=: '/node_modules\/.bin/ {next} {print}'`
echo "Old Path: ${OLD_PATH}"
echo "New Path: ${PATH}"
echo "npm install"
NODE_ENV=development
npm install

echo "building auspice (npm run build)"
npm run build

echo "Jumping back to parent directory & resetting PATH"
cd ..
env PATH=${OLD_PATH}

echo "into the Static site"
cd nextstrain.org

echo "installing from npm"
npm install

echo "building gatsby"
npm run build

echo "building the server"
cd ..
rm auspice/.babelrc # why? you get errors because or node_module pathing and babelrc defined plugins. I don't understand why /auspice/.babelrc is even being looked at!
npm run build

echo "DONE :) Now the Procfile will run the server"
