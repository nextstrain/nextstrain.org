import { jest } from '@jest/globals';

import {
  connectingIp,
  isPrivateOrReservedIp,
  matchesBlockedRequest,
  blockRequests,
  isStaticAssetPath,
} from '../src/middleware.js';

describe("connectingIp", () => {
  test("uses the right-most X-Forwarded-For entry (the peer Heroku appends)", () => {
    expect(connectingIp({ headers: { "x-forwarded-for": "1.2.3.4" } })).toBe("1.2.3.4");
    expect(connectingIp({ headers: { "x-forwarded-for": "9.9.9.9, 1.2.3.4" } })).toBe("1.2.3.4");
  });

  test("ignores a spoofed left-most entry", () => {
    // The attacker prepends 127.0.0.1; Heroku appends the true peer on the right.
    expect(connectingIp({ headers: { "x-forwarded-for": "127.0.0.1, 203.0.113.9" } })).toBe("203.0.113.9");
  });

  test("trims whitespace around hops", () => {
    expect(connectingIp({ headers: { "x-forwarded-for": "9.9.9.9 ,  1.2.3.4 " } })).toBe("1.2.3.4");
  });

  test("falls back to the socket address when there is no XFF header", () => {
    expect(connectingIp({ headers: {}, socket: { remoteAddress: "127.0.0.1" } })).toBe("127.0.0.1");
  });
});

describe("isPrivateOrReservedIp", () => {
  test.each([
    ["127.0.0.1", true],
    ["10.0.0.5", true],
    ["192.168.1.1", true],
    ["172.16.0.1", true],
    ["172.31.255.255", true],
    ["169.254.1.1", true],
    ["::1", true],
    ["::ffff:127.0.0.1", true],   // IPv4-mapped IPv6 loopback
    ["fe80::1", true],
    ["fd12:3456::1", true],
    ["185.177.72.67", false],
    ["8.8.8.8", false],
    ["172.32.0.1", false],        // just outside 172.16/12
    ["172.15.0.1", false],
    [undefined, false],
  ])("%s → %s", (ip, expected) => {
    expect(isPrivateOrReservedIp(ip)).toBe(expected);
  });
});

describe("matchesBlockedRequest", () => {
  const blocked = [
    ["GET", "/.env"],
    ["GET", "/config/.env"],
    ["GET", "/.env.production"],
    ["POST", "/.env"],                          // method-agnostic
    ["GET", "/info.php"],
    ["GET", "/index.php7"],
    ["GET", "/phpinfo"],
    ["GET", "/admin/phpinfo.php"],
    ["GET", "/x/php://filter/resource=y"],      // php:// LFI wrapper in the path
    ["GET", "/.git/config"],
    ["GET", "/.aws/credentials"],
    ["GET", "/.ssh/id_rsa"],
    ["GET", "/.htaccess"],
    ["GET", "/.DS_Store"],
    ["GET", "/wp-login.php"],
    ["GET", "/wp-admin/"],
    ["GET", "/vendor/phpunit/phpunit"],
    ["GET", "/actuator/health"],
    ["GET", "/yo5ITNamz8tKPAVs0K73HA/e6d72660-998f-48dc-b728-b59e00151bfb"],
    ["GET", "/yo5ITNamz8tKPAVs0K73HA/e6d72660-998f-48dc-b728-b59e00151bfb/0"],
  ];
  test.each(blocked)("blocks %s %s", (method, path) => {
    expect(matchesBlockedRequest(method, path)).toBe(true);
  });

  const allowed = [
    ["GET", "/"],
    ["GET", "/ncov/gisaid/global/6m"],
    ["GET", "/groups/blab"],
    ["GET", "/community/nextstrain/zika"],
    ["GET", "/whoami"],
    ["GET", "/flu/seasonal"],
    // Regression guards for the substrings that collide with legit paths:
    ["GET", "/.well-known/openid-configuration"],                                                    // OIDC discovery
    ["GET", "/community/nextstrain/x.github.io"],                                                    // .github ≠ /.git/
    ["GET", "/fetch/narratives/raw.githubusercontent.com/nextstrain/narratives/master/intro.md"],    // githubusercontent
    ["GET", "/_next/static/chunks/vendors-abc.js"],                                                  // vendors ≠ /vendor/
    ["GET", "/community/some-user/hiv/env"],                                                         // env gene ≠ /.env
    ["GET", "/community/user/my.env.dashboard"],                                                     // mid-segment .env ≠ /.env
    ["GET", "/enterovirus/d68/genome"],
  ];
  test.each(allowed)("allows %s %s", (method, path) => {
    expect(matchesBlockedRequest(method, path)).toBe(false);
  });
});

describe("isStaticAssetPath", () => {
  test.each([
    ["/_next/static/chunks/main.js", true],
    ["/dist/bundle.js", true],
    ["/favicon.ico", true],
    ["/ncov/gisaid/global/6m", false],
    ["/", false],
  ])("%s → %s", (path, expected) => {
    expect(isStaticAssetPath(path)).toBe(expected);
  });
});

describe("blockRequests middleware", () => {
  // blockRequests throws a Forbidden (403) on a hit and calls next() otherwise.
  const run = (req) => {
    const next = jest.fn();
    let thrown;
    try { blockRequests(req, {}, next); } catch (e) { thrown = e; }
    return { next, thrown };
  };

  test("passes a legitimate request through", () => {
    const { next, thrown } = run({ method: "GET", path: "/ncov/gisaid/global/6m", headers: { "x-forwarded-for": "8.8.8.8" } });
    expect(next).toHaveBeenCalledTimes(1);
    expect(thrown).toBeUndefined();
  });

  test("throws 403 on a blocked-pattern path", () => {
    const { next, thrown } = run({ method: "GET", path: "/config/.env", headers: { "x-forwarded-for": "8.8.8.8" } });
    expect(next).not.toHaveBeenCalled();
    expect(thrown?.status).toBe(403);
  });

  test("throws 403 for a committed blocked IP (right-most XFF, not the spoofed left)", () => {
    const { next, thrown } = run({ method: "GET", path: "/", headers: { "x-forwarded-for": "203.0.113.1, 185.177.72.67" } });
    expect(next).not.toHaveBeenCalled();
    expect(thrown?.status).toBe(403);
  });
});
