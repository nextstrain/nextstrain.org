import escapeStringRegexp from 'escape-string-regexp';


/**
 * Safe-by-construction URI strings via [template literals]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates}.
 *
 * Interpolations in the template literal are automatically URI-encoded.
 *
 * @returns string
 */
export function uri(literalParts, ...exprParts) {
  /* The tagged template literal is given to us as two lists: the literal parts
   * and the interpolated expression values (i.e. the evaluation of … inside
   * ${…}).  We zip and concatenate the two lists together while URI-encoding
   * the interpolated values.
   *
   * There is always one more literal part than expression part—though it may
   * be the empty string—and the whole template literal starts with the first
   * literal part.
   *   -trs, 4 May 2023
   */
  return literalParts.slice(1).reduce(
    (url, literalPart, idx) => `${url}${encodeURIComponent(exprParts[idx])}${literalPart}`,
    literalParts[0]
  );
}


/**
 * Safe-by-construction RegExps from strings via [template literals]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates}.
 *
 * Interpolations in the template literal are automatically escaped so no regex
 * metachars are interpretted.
 *
 * @returns RegExp
 */
export function re(literalParts, ...exprParts) {
  /* See comment above in uri() about the data structures involved.
   */
  return literalParts.slice(1).reduce(
    (re, literalPart, idx) => new RegExp(`${re.source}${escapeStringRegexp(exprParts[idx])}${literalPart}`),
    new RegExp(literalParts[0])
  );
}
