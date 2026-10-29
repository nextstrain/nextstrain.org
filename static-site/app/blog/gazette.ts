import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Loader for gazette bundles. A gazette document is compiled by the `gazette`
 * CLI into a self-contained bundle under `static-site/public/gazette/<id>/`
 * (see `npm run build:gazette`), and surfaced on the blog as the post with
 * that `<id>`. This module reads a bundle's server-rendered HTML + hydration
 * manifest off disk so `app/blog/[id]/page.tsx` can render it via the
 * `<GazettePaper>` companion component.
 */

/**
 * The hydration manifest emitted alongside each bundle's `article.html`. All
 * asset URLs are absolute, already rewritten against the bundle's base path.
 */
export interface GazetteManifest {
  /** URL prefix the bundle is served from, e.g. `/gazette/<id>` */
  basePath: string;

  /** absolute URL of the shadow-root stylesheet */
  stylesheet: string;

  /** the document's YAML frontmatter (title, authors, date, citation, …) */
  frontmatter: Record<string, unknown>;

  /** interactive figures to hydrate on the client */
  islands: Array<{
    figId: string;
    mountId: string;
    /** absolute URL of the figure component module, e.g. /gazette/<id>/figures/trend-line.js */
    module: string;
    /** dataset key -> absolute dataset URL */
    data: Record<string, string>;
    opts: Record<string, unknown>;
  }>;

  /** `:trigger` payloads authored in the prose */
  triggers: Array<{ target: string; update: unknown }>;
}

/**
 * Directory holding the built bundle for blog post `<id>`.
 *
 * Resolved relative to this module's own location rather than
 * `process.cwd()`, because this app is built via `next build static-site`
 * from the repo root (so `process.cwd()` is the repo root, not the Next app
 * root). `blog/utils.ts` resolves `content/blog` the same way.
 */
function bundleDir(id: string): string {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  // dirname === static-site/app/blog -> ../../public/gazette/<id>
  return path.join(dirname, "..", "..", "public", "gazette", id);
}

/** Whether a gazette bundle has been built for this blog id. */
export function gazetteBuildExists(id: string): boolean {
  try {
    return fs.existsSync(path.join(bundleDir(id), "manifest.json"));
  } catch {
    return false;
  }
}

/** Read a built bundle's server-rendered HTML and hydration manifest. */
export function loadGazetteBuild(id: string): {
  articleHtml: string;
  manifest: GazetteManifest;
} {
  const dir = bundleDir(id);
  const articleHtml = fs.readFileSync(path.join(dir, "article.html"), "utf8");
  const manifest = JSON.parse(
    fs.readFileSync(path.join(dir, "manifest.json"), "utf8"),
  ) as GazetteManifest;
  return { articleHtml, manifest };
}
