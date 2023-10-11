/**
 * Iterator utilities.
 *
 * @module utils.iterators
 */


/**
 * Maps a function over any iterable, including async ones.
 *
 * If the iterable has a "map" property, it's called directly.
 *
 * @param {Object} it - [Iterable object]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol}, e.g. an array, Set, Map, generator, async generator, etc.
 * @param {Function} fn - Synchronous mapping function taking an element and returning a mapped value.
 * @returns {Array}
 */
export async function map(it, fn) {
  if (it.map) return it.map(x => fn(x));

  const array = [];
  for await (const x of it) {
    /* Apply fn() as we go to avoid keeping all of the untransformed and
     * potentially large elements in memory at once.
     */
    array.push(fn(x));
  }
  return array;
}


/**
 * Consume an potentially-async iterable into an array.
 *
 * @param {Object} it - [Iterable object]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol}, e.g. an array, Set, Map, generator, async generator, etc.
 * @returns {Array}
 */
export async function slurp(it) {
  return await map(it, x => x);
}
