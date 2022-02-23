/* eslint-disable indent, no-multi-spaces, semi-spacing */

/**
 * Convert Set and Map objects for {@link JSON.stringify}.
 */
const replacer = (key, value) =>
  value instanceof Set ?                          [...value] :
  value instanceof Map ? Object.fromEntries(value.entries()) :
                                                       value ;

module.exports = {
  replacer,
};
