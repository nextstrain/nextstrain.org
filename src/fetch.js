import debugFactory from 'debug';
import { readFile } from 'fs/promises';
import LinkHeader from 'http-link-header';
import __fetch from 'make-fetch-happen';
import { fileURLToPath } from 'url';

const debug = debugFactory("nextstrain:fetch");

const {version: makeFetchHappenVersion} = JSON.parse(await readFile(fileURLToPath(import.meta.resolve("make-fetch-happen/package.json"))));

const USER_AGENT = `nextstrain.org (https://nextstrain.org) make-fetch-happen/${makeFetchHappenVersion} (https://www.npmjs.com/package/make-fetch-happen)`;

const FETCH_OPTIONS = Symbol("Request options for make-fetch-happen");

const _fetch = __fetch.defaults({
  cache: "default",
  cacheManager: process.env.FETCH_CACHE || "/tmp/fetch-cache",
});

const fetch = async (url, options) => {
  // Provide our own User-Agent unless the request comes with one
  if (!(new Headers(options?.headers ?? {})).has("User-Agent")) {
    options ??= {};
    options.headers ??= {};
    options.headers["User-Agent"] = USER_AGENT;
  }

  /* "url" may be a URL or a Request object, but always construct our own
   * Request() so the rest of this function only has to deal with a single
   * interface instead of looking for properties like "method" and "cache" on
   * both "options" and "url" (if a Request).
   */
  const request = new Request(url, options);

  debug(`${request.method} ${request.url} (cache: ${request.cache})`);

  // See comment below on why we do fetch(request, options)
  const response = await _fetch(request, request[FETCH_OPTIONS]);
  const cachedAt = response.headers.get("X-Local-Cache-Time"); // documented by make-fetch-happen
  const cachedStatus = response.headers.get("X-Local-Cache-Status"); // documented by make-fetch-happen

  debug(`${response.status} ${response.statusText} ${response.url} ${(cachedAt || cachedStatus) ? `(cache ${cachedStatus}, timestamp ${cachedAt})` : ''}`);

  return response;
};

class Request extends __fetch.Request {
  /* make-fetch-happen's fetch() extends Node's fetch() by adding support for
   * several caching-related features in the WHATWG Fetch spec that Node
   * doesn't implement.  However, make-fetch-happen (unintentionally?) assumes
   * sole usage of the fetch(url, options) API and doesn't fully support the
   * fetch(request) API in the standard.¹  This manifests as not respecting
   * options like "cache" in uses like:
   *
   *    fetch(new Request(url, {cache: …}))
   *
   * The fetch(request) API is handy in cases where requests are
   * programmatically generated, so work around this limitation by storing the
   * original options passed to Request() and then duplicating them into a
   * fetch(request, options) call in our own fetch() above.
   *   -trs, 16 Nov 2021
   *
   * ¹ The reason is that internally make-fetch-happen passes around the
   *   options object instead of merging options into its own Request subclass
   *   and only passing around the Request instance.  With a little more work,
   *   I think this would be a good improvement to contribute back to
   *   make-fetch-happen.
   */
  constructor(input, init = {}) {
    super(input, init);

    this[FETCH_OPTIONS] = input instanceof Request
      ? {...input[FETCH_OPTIONS], ...init}
      : init;
  }

  /* Many of make-fetch-happen's options are part of the Request interface² in
   * the WHATWG Fetch standard and supposed to be exposed on the Request as
   * properties.  Since make-fetch-happen never sets them on the Request,
   * expose the properties we want here ourselves.  This is not the complete
   * set.
   *   -trs, 16 Nov 2021
   *
   * ² https://developer.mozilla.org/en-US/docs/Web/API/Request
   */
  get cache() { return this[FETCH_OPTIONS].cache; }
}

/**
 * Fetch one or more pages of a resource by starting at the given URL and
 * iteratively following the Link header's rel=next URLs in the responses until
 * they run out.
 *
 * @param {String} url - same as {@link fetch#url}
 * @param {Object} options - same as {@link fetch#options}
 * @param {Function} pageFn - Function (synchronous or asynchronous) that maps the Response for a single page to an iterable, e.g. an array or generator.
 */
async function* paginatedFetch(url, options, pageFn) {
  let nextPage = url;

  while (nextPage) {
    const response = await fetch(nextPage, options);

    yield* pageFn(response);

    nextPage = LinkHeader.parse(response.headers.get("Link") ?? "").rel("next")[0]?.uri;
  }
}

export {
  fetch,
  paginatedFetch,
  Request,
};
