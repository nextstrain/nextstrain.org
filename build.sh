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
        blog)
            build-blog;;
        all)
            echo "Running the nextstrain.org build script"
            build-auspice
            build-static    # Depends on Auspice being built
            build-blog      # Depends on the static (Next.js) site being built
            echo "Build complete. Next step: run the server..."
            echo -e "\tPRODUCTION: \"npm run server\""
            echo -e "\tLOCALLY: \"USE_PREBUILT_STATIC_SITE=1  node server.js --verbose\""
            ;;
        *)
            echo "Unknown build step \"$step\"" >&2
            exit 1;;
    esac
}

build-static() {
    echo "Building the static Next.JS app (pages defined in static-site/pages, assets written to static-site/.next)"
    ./node_modules/.bin/next build static-site
}

build-blog() {
    echo "Building the static gazette blog (chrome snapshot + static blog assembly)"

    # The chrome snapshot is extracted from a built Next.js site and embeds that
    # build's content-hashed asset URLs, so it must reuse — not rebuild — the
    # canonical `next build` output (see scripts/gazette-blog/snapshot-chrome.sh).
    # Fail early if the static site hasn't been built yet. BUILD_ID is written by
    # `next build` (and required by `next start`), so it's a reliable sentinel.
    if [ ! -f static-site/.next/BUILD_ID ]; then
        echo >&2
        echo "build-blog: static-site/.next/BUILD_ID not found — the Next.js site" >&2
        echo "build-blog: has not been built. Run './build.sh static' first (or use" >&2
        echo "build-blog: './build.sh all', which builds it before the blog)." >&2
        echo >&2
        exit 1
    fi

    npm run build:gazette
    # Reuse the existing build (snapshot:chrome defaults to --no-build) so the
    # snapshotted chrome's asset hashes match the build the server will serve.
    npm run snapshot:chrome
    npm run build:static-blog
    npm run build:feeds
}

build-auspice() {
    echo "Building a customised version of auspice"
    cd auspice-client
    npm ci
    ./node_modules/.bin/auspice build --verbose --extend ./customisations/config.json
    cd ..
}

main "$@"
