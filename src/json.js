/**
 * Convert Set and Map objects for {@link JSON.stringify}.
 */
export const replacer = (key, value) =>
  value instanceof Set ?                          [...value] :
  value instanceof Map ? Object.fromEntries(value.entries()) :
                                                       value ;
