#!/bin/bash

trap 'kill 0' EXIT

# Starts "gatsby develop" on localhost:8000
(cd static-site && npm run develop) &

# watch for changes to our client-side code
for CLIENT_SIDE_JS in $( ls src/client-components/*.js ); do
  # TODO XXX -- rollup in watch mode (-w) isn't working as I expect...
  # (npx rollup -w -c rollup.config.js --input ${CLIENT_SIDE_JS}) &
  (npx rollup -c rollup.config.js --input ${CLIENT_SIDE_JS}) &
done

# Start Express server with proxying of Gatsby assets to localhost:8000
NODE_ENV="dev" GATSBY_DEV_URL=http://localhost:8000 ./node_modules/.bin/nodemon --verbose -- server.js --verbose

wait
