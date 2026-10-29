#!/usr/bin/env bash
# Build the gazette integration: the companion runtime components and the
# compiled bundle(s) for gazette-authored blog posts.
#
# This is a PROTOTYPE integration (see next-integration.md). It requires the
# `gazette` CLI on PATH (available in the project conda environment). It:
#
#   1. generates the `next` runtime components (GazettePaper.jsx +
#      GazetteHydrator.jsx) into static-site/components/gazette/, and
#   2. compiles each gazette document — a project directory under repo-root
#      blog/<id>/ whose entry Markdown is named after the directory
#      (blog/<id>/<id>.md) — into a bundle served at /gazette/<id>/ and surfaced
#      on the blog as the post with that <id>.
#
# Run from the repo root (or via `npm run build:gazette`). Both the components
# and the bundles are build artifacts and are gitignored.
set -eEuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
blog_src_dir="${repo_root}/blog"
public_dir="${repo_root}/static-site/public"
components_dir="${repo_root}/static-site/components/gazette"

if ! command -v gazette >/dev/null 2>&1; then
    echo "error: the 'gazette' CLI is not on PATH." >&2
    echo "       Activate the project conda environment and try again." >&2
    exit 1
fi

# 1. Generate the companion runtime components (overwrites any previous copy).
echo "gazette: generating next runtime components -> ${components_dir}"
gazette runtime --target next --out "${components_dir}"

# 2. Compile the document bundle(s). For this MVP there is a single gazette
# post. The loop lets more be added by dropping another project directory into
# blog/ whose entry Markdown is named after the directory (blog/<id>/<id>.md).
shopt -s nullglob
found=0
for doc in "${blog_src_dir}"/*/; do
    id="$(basename "${doc}")"
    entry="${doc}${id}.md"
    [ -f "${entry}" ] || continue
    found=1
    echo "gazette: building blog post '${id}'"

    gazette snapshot "${entry}"

    gazette build "${entry}" --target pdf --out "${public_dir}"
    
    gazette build "${entry}" \
        --target next \
        --base-path "/gazette/${id}" \
        --out "${public_dir}"
done

if [ "${found}" -eq 0 ]; then
    echo "gazette: no gazette projects found under ${blog_src_dir}/ (nothing to build)"
fi
