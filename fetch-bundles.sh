#!/usr/bin/env bash

echo "Running the nextstrain.org bash build script"

function errorFound {
  echo -e "\nScript Failed at step $step (Line $1)\nYou are responsible for clean up (sorry!)"
  exit 2
}
# TRAPS
trap 'errorFound $LINENO' ERR

echo "Fetching auspice"
curl https://s3.amazonaws.com/nextstrain-bundles/auspice.tar.gz --output auspice.tar.gz

echo "Uncompressing auspice"
if [ -d "auspice" ]; then
  rm -rf auspice
fi
mkdir auspice
tar -xzvf auspice.tar.gz -C auspice/

echo "Fetching static"
curl https://s3.amazonaws.com/nextstrain-bundles/static.tar.gz --output static.tar.gz

echo "Uncompressing static"
if [ -d "static" ]; then
  rm -rf static
fi
mkdir static
tar -xzvf static.tar.gz -C static/
