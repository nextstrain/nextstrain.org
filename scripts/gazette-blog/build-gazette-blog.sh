#!/usr/bin/env bash
# Build gazette-authored blog posts into fully static, self-contained HTML
# pages. These pages will not be served directly by nextstrain.org, instead
# they will be combined with nextstrain-styled header & footer HTML and the
# combined HTML seved by our express server (which is done in a separate step).
#
# For each gazette document — a project directory under `{repo-root}/blog/<id>/`
# with an entry markdown file `<id>.md` - this script:
#
#   1. builds the PDF (when the static page marks it as offered for download)
#   2. builds gazette's `static` target: a complete, self-hydrating HTML page
#      whose CSS is confined with native @scope (no Next, no React),
#      into .gazette-build/<id>/static/ (gitignored)
#
# Run from the repo root (or via `npm run build:gazette`). .gazette-build/ (the
# intermediate) and blog-dist/ (the served output) are both gitignored.
set -eEuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
blog_src_dir="${repo_root}/blog"
build_dir="${repo_root}/.gazette-build"

if ! command -v gazette >/dev/null 2>&1; then
    echo "error: the 'gazette' CLI is not on PATH." >&2
    echo "       Activate the project conda environment and try again." >&2
    exit 1
fi

# Compile each document. The loop lets more posts be added by dropping another
# project directory into blog/ whose entry Markdown is named after the directory.
shopt -s nullglob
found=0
for doc in "${blog_src_dir}"/*/; do
    id="$(basename "${doc}")"
    entry="${doc}${id}.md"
    [ -f "${entry}" ] || continue
    found=1
    out="${build_dir}/${id}"
    echo -e "\n[BLOG POST] ${id}"

    # snapshot the figures (i.e. generate static fallbacks)
    # for use with the PDF and the static HTML
    gazette snapshot "${entry}"
    
    # Only produce the PDF if requested:
    # The PDF must exist before the static build (the page links it for download)
    if grep -qi 'pdf-download: true' "${entry}"; then
        echo "[generating PDF version as requested]"
        gazette build "${entry}" --target pdf --out "${out}"
    fi

    # The static HTML page
    gazette build "${entry}" --target static --out "${out}"
done

if [ "${found}" -eq 0 ]; then
    echo "gazette: no gazette projects found under ${blog_src_dir}/ (nothing to build)"
    exit 0
fi

echo "gazette: compiled -> .gazette-build/. Next: 'npm run snapshot:chrome' (server up) then 'npm run build:static-blog'."
