const __fetch = require("make-fetch-happen");
const utils = require("./utils");

const _fetch = __fetch.defaults({
  cache: "default",
  cacheManager: process.env.FETCH_CACHE || "/tmp/fetch-cache",
});

const fetch = async (url, options) => {
  utils.verbose(`[fetch] ${options && options.method || "GET"} ${url}`);

  const response = await _fetch(url, options);
  const cachedAt = response.headers.get("X-Local-Cache-Time"); // documented by make-fetch-happen

  utils.verbose(`[fetch] ${response.status} ${response.statusText} ${response.url} ${cachedAt ? `(from cache, timestamp ${cachedAt})` : ''}`);

  return response;
};

module.exports = {
  fetch,
};
