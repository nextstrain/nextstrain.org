#!/bin/bash

trap 'kill 0' EXIT

NODE_ENV="dev" node server.js &
cd static-site && npm run develop

wait
