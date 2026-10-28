import fetch from 'node-fetch';
import { url, accept } from './helpers.js';

const noCache = [
  { path: "/charon/getAvailable?prefix=ncov/open/global/6m", mediaType: "*/*" },
  { path: "/cli/download/latest/standalone-x86_64-unknown-linux-gnu.tar.gz", mediaType: "*/*" },
  { path: "/list-resources/core/dataset", mediaType: "application/json" },
  { path: "/whoami", mediaType: "application/json" },
  { path: "/whoami", mediaType: "text/html" },
];

const cacheByNextJs = [
  { path: "/", mediaType: "text/html" },
];

const cacheByAuspice = [
  { path: "/dist/index.html", mediaType: "text/html" },
];

describe("Shared (CDN) caching forbidden by global default", () => {
  test.each(noCache)("$path ($mediaType)",
    async ({ path, mediaType }) => {
      const res = await fetch(url(path), { ...accept(mediaType), redirect: "manual" });
      expect(res.headers.get("cache-control")).toBe("private, no-cache");
    }
  );
});

describe("Shared (CDN) caching allowed by Next.js handler", () => {
  test.each(cacheByNextJs)("$path ($mediaType)",
    async ({ path, mediaType }) => {
      const res = await fetch(url(path), accept(mediaType));
      expect(res.headers.get("cache-control")).toBe("s-maxage=31536000, stale-while-revalidate");
    }
  );
});

describe("Shared (CDN) caching allowed by Auspice handler", () => {
  test.each(cacheByAuspice)("$path ($mediaType)",
    async ({ path, mediaType }) => {
      const res = await fetch(url(path), accept(mediaType));
      expect(res.headers.get("cache-control")).toBe("public, max-age=2592000");
    }
  );
});
