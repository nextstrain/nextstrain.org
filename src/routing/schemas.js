import { NotFound } from '../httpErrors.js';

/* JSON Schemas.
 *
 * Our schemas identity themselves using nextstrain.org URLs so that we can
 * move the actual file location around (e.g. renaming in Augur's repo or
 * moving hosting on S3) without changing the ids.  This is important as ids
 * should be ~permanent since they're consumed and used externally.  The
 * indirection will also let us present rendered, human-friendly versions of
 * the schemas to browsers/humans while still returning the JSON representation
 * to programmatic clients, though we're not this fancy yet.
 */
const schemaRoutes = [
  ["/schemas/augur/annotations",         "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-annotations.json"],
  ["/schemas/augur/frequencies",         "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-frequencies.json"],
  ["/schemas/augur/subsample-config/v1", "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-subsample-config.json"],
  ["/schemas/auspice/config/v2",         "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-auspice-config-v2.json"],
  ["/schemas/dataset/v1/meta",           "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-export-v1-meta.json"],
  ["/schemas/dataset/v1/tree",           "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-export-v1-tree.json"],
  ["/schemas/dataset/v2",                "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-export-v2.json"],
  ["/schemas/dataset/root-sequence",     "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-export-root-sequence.json"],
  ["/schemas/dataset/tip-frequencies",   "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-tip-frequencies.json"],
  ["/schemas/dataset/measurements",      "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-measurements.json"],
  ["/schemas/pathogen/v0",               "https://raw.githubusercontent.com/nextstrain/cli/HEAD/nextstrain/cli/resources/schema-pathogen-v0.json"],
];


export function setup(app) {
  for (const [schemaRoute, url] of schemaRoutes) {
    app.route(schemaRoute)
      .get((req, res) => res.redirect(url));
  }

  app.route("/schemas/*")
    .all((req, res, next) => next(new NotFound()));
}
