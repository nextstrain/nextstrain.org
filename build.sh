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
    echo "Building the static Next.JS app (pages defined in static-site/pages, assets written to static-site/.next)"
    npm run build:feeds
    # Generate the gazette runtime components and compile the gazette blog
    # bundle(s) before `next build`, since the blog route imports the generated
    # components and reads the bundles from public/ at build time. Requires the
    # `gazette` CLI on PATH (see static-site/components/gazette/README.md).
    npm run build:gazette
    ./node_modules/.bin/next build static-site
}

build-auspice() {
    echo "Building a customised version of auspice"
    cd auspice-client
    npm ci
    ./node_modules/.bin/auspice build --verbose --extend ./customisations/config.json
    cd ..
}

main "$@"
