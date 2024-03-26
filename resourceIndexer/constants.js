export const DATESTAMP_REGEXES = [
  /_\d{4}-\d{2}-\d{2}/,
  /_\d{4}-\d{2}/, /* used in some influenza datasets */
]

export const INVALID_AUSPICE_PATTERNS = [
  /_seq\.json$/,
  /_sequences\.json$/,
  /_entropy\.json$/,
  /_titers\.json$/,
  /_frequencies\.json$/, /* historically used for flu analyses outside of auspice */
];

/**
 * These patterns can be used to classify files which are potentially valid
 * auspice files. They should be checked in order, with the first match winning.
 *
 * Each entry is a tuple of [subresource type, regex match pattern].
 *
 * The subresource type (string) is the same as that used internally in the
 * server code (used when instantiating (sub-)classes of `Subresource`)
 */
export const VALID_AUSPICE_PATTERNS = [
  ["root-sequence", /_root-sequence\.json$/],
  ["tip-frequencies", /_tip-frequencies\.json$/],
  ["measurements", /_measurements\.json$/],
  ["meta",  /_meta\.json$/],
  ["tree",  /_tree\.json$/],
  ["main", /\.json$/],
]

export const SIDECAR_TYPES = new Set(
  VALID_AUSPICE_PATTERNS
    .map(([subresourceType, ]) => subresourceType)
    .filter((subresourceType) => !['main', 'meta', 'tree'].includes(subresourceType))
)

/**
 * Following values taken to match the server's `sourceNameToClass`.
 */
export const SOURCE = {
  CORE: "core",
  STAGING: "staging",
}
