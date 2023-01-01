#!/usr/bin/env bash

# By default, the way to build a create-react-app is to run `npx react-scripts build`
# often implemented as a `npm run build` script via `"build": "react-scripts build"`
# which will create an asset heirarchy like so:
#
# ./build/index.html                  - fetches /static/js/main.<hash>.js
#        /static/js/main.<hash>.js
#
# which is easily runnable via `python -m http.server --directory build`
#
# As our intention is to host this as an app within the larger nextstrain.org app
# we really want a unique folder name for the static assets to make routing
# easier to understand and implement.
#
# This build script aims to produce a heirarchy like so:
#
# ./build/index.html                  - fetches /forecasting-viz-assets/static/js/main.<hash>.js
#        /forecasting-viz-assets/static/js/main.<hash>.js

rm -rf build
PUBLIC_URL="/forecasting-viz-assets" npx react-scripts build
mkdir -p build/forecasting-viz-assets/static
mv build/static build/forecasting-viz-assets/
echo "Test this build locally via 'python -m http.server --directory build'"
