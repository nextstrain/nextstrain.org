#!/usr/bin/env bash
set -eEuo pipefail

on-error() {
    exec >&2
    echo
    echo "Build failed at ${BASH_SOURCE[0]} line ${BASH_LINENO[0]}"
    echo
    echo "You are responsible for clean up (sorry!)"
    exit 1
}

trap on-error ERR

main() {
    local step="${1:-all}"

    case "$step" in
        static)
            build-static;;
        auspice)
            build-auspice;;
        all)
            echo "Running the nextstrain.org build script"
            build-static
            build-auspice
            echo "Build complete. Next step: \"npm run server\"";;
        *)
            echo "Unknown build step \"$step\"" >&2
            exit 1;;
    esac
}

build-static() {
    echo "Building the static site (./static-site/public/)"
    cd static-site
    npm install # this needs python 2
    npm run build # build using gatsby. Can take a few minutes.
    cd ..
}

build-auspice() {
    echo "Installing auspice (globally)"
    # npm install --global auspice@1.37.5
    
    # for testing reasons (e.g. deploying to dev-heroku server) you may wish to
    # install from a github branch (useful for auspice versions not pushed to npm)
    npm install --global https://github.com/nextstrain/auspice/tarball/v2

    echo "Building a customised version of auspice"
    cd auspice
    auspice build --verbose --extend ./client/config.json
    cd ..
}

main "$@"
