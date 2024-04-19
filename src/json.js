/**
 * Convert Set and Map objects for {@link JSON.stringify}.
 */
const replacer = (key, value) =>
  value instanceof Set ?                          [...value] :
  value instanceof Map ? Object.fromEntries(value.entries()) :
                                                       value ;

export {
  replacer,
};
