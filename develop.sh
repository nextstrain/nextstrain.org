#!/bin/bash

trap 'kill 0' EXIT

npm run server &
cd static-site && npm run develop

wait
