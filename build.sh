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
            build-auspice
            build-static    # Depends on Auspice being built
            echo "Build complete. Next step: \"npm run server\"";;
        *)
            echo "Unknown build step \"$step\"" >&2
            exit 1;;
    esac
}

build-static() {
    echo "Building the static site (./static-site/public/)"
    cd static-site
    npm ci
    npm run build # build using gatsby. Can take a few minutes.
    cd ..
}

build-auspice() {
    echo "Building a customised version of auspice"
    cd auspice-client
    npm ci
    ./node_modules/.bin/auspice build --verbose --extend ./customisations/config.json
    cd ..
}

main "$@"
