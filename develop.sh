#!/bin/bash

trap 'kill 0' EXIT

# Starts "gatsby develop" on localhost:8000
(cd static-site && npm run develop) &

# Start Express server with proxying of Gatsby assets to localhost:8000
NODE_ENV="dev" GATSBY_DEV_URL=http://localhost:8000 node server.js --verbose

wait
