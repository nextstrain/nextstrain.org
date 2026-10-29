#!/usr/bin/env bash
# Snapshot the static blog's site chrome from the REAL <Nav/>/<Footer/>
# components, served by Next.js itself (not our Express server).
#
# The chrome-snapshot route (static-site/app/chrome-snapshot) exists in the
# Next.js build so the chrome can be snapshotted, but our Express server 404s it
# (see src/routing/staticBlog.js) so it is never exposed on the deployed site.
# This script therefore serves the route with Next's own server instead:
#
#   1. build the static Next.js site (unless --no-build),
#   2. serve the PREBUILT build with `next start` on a private port,
#   3. snapshot /chrome-snapshot from it (snapshot-chrome.mjs),
#   4. stop `next start`.
#
# This is the production/CI equivalent of running against a USE_PREBUILT_STATIC_SITE=1
# server, but via `next start` so the Express 404 block does not apply.
#
# By DEFAULT this reuses the existing `next build` output (no rebuild). This is
# almost always what you want: the snapshot bakes in Next's content-hashed asset
# URLs (/_next/static/media/…) for the logo/avatars/funder logos, and those
# hashes must match the build the server serves. Reusing the canonical build
# guarantees that. Pass --build to run a fresh `next build` here instead — only
# correct if THIS build is also the one served; otherwise the chrome's images
# will 404 against the serving build.
#
# Run from the repo root (or via `npm run snapshot:chrome`).
set -eEuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repo_root}"

PORT="${CHROME_SNAPSHOT_PORT:-5555}"
NEXT="${repo_root}/node_modules/.bin/next"

# Default: reuse the existing build. --build opts in to a fresh `next build`.
# --no-build is accepted as a (now redundant) explicit form of the default.
do_build=0
case "${1:-}" in
    --build)    do_build=1;;
    --no-build) do_build=0;;
    "")         ;;
    *) echo "snapshot-chrome: unknown argument '${1}' (expected --build or --no-build)" >&2; exit 1;;
esac

if [ "${do_build}" -eq 1 ]; then
    echo "snapshot-chrome: =====================================================================" >&2
    echo "snapshot-chrome: WARNING: --build runs a fresh 'next build static-site'." >&2
    echo "snapshot-chrome: The snapshot embeds this build's hashed asset URLs" >&2
    echo "snapshot-chrome: (/_next/static/media/…). They are ONLY valid if the server also" >&2
    echo "snapshot-chrome: serves THIS build; otherwise the chrome's logo/avatars/logos 404." >&2
    echo "snapshot-chrome: In CI, prefer the default (reuse the canonical build) instead." >&2
    echo "snapshot-chrome: =====================================================================" >&2
    echo "snapshot-chrome: building the static Next.js site (next build static-site)"
    "${NEXT}" build static-site
else
    echo "snapshot-chrome: reusing the existing next build (pass --build to force a rebuild)"
fi

log="$(mktemp -t gazette-next-start.XXXXXX)"
echo "snapshot-chrome: serving the prebuilt site with 'next start' on :${PORT} (log: ${log})"
"${NEXT}" start static-site -p "${PORT}" >"${log}" 2>&1 &
next_pid=$!
cleanup() { kill "${next_pid}" 2>/dev/null || true; }
trap cleanup EXIT

# Wait until the route answers (or next start dies).
ready=0
for _ in $(seq 1 90); do
    if curl -sf "http://localhost:${PORT}/chrome-snapshot" -o /dev/null; then ready=1; break; fi
    kill -0 "${next_pid}" 2>/dev/null || { echo "snapshot-chrome: 'next start' exited early:" >&2; tail -20 "${log}" >&2; exit 1; }
    sleep 1
done
[ "${ready}" -eq 1 ] || { echo "snapshot-chrome: timed out waiting for next start" >&2; tail -20 "${log}" >&2; exit 1; }

node "${repo_root}/scripts/gazette-blog/snapshot-chrome.mjs" "http://localhost:${PORT}"
