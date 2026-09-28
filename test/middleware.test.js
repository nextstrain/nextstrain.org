import { jest } from '@jest/globals';

import {
  connectingIp,
  matchesBlockedRequest,
  isStaticAssetPath,
  blockRequests,
  blockIps,
} from '../src/middleware.js';

/* Minimal Express response double: records status/headers/body so we can assert
 * whether a request was rejected (status set) or passed through (next called).
 * Methods are chainable, mirroring the real res.set().status().type().end(). */
function mockRes() {
  return {
    statusCode: undefined,
    headers: {},
    body: undefined,
    set(key, value) { this.headers[key] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    type() { return this; },
    end(body) { this.body = body; return this; },
  };
}

describe("connectingIp", () => {
  test("uses the right-most X-Forwarded-For entry (the peer Heroku appends)", () => {
    expect(connectingIp({ headers: { "x-forwarded-for": "1.2.3.4" } })).toBe("1.2.3.4");
    expect(connectingIp({ headers: { "x-forwarded-for": "9.9.9.9, 1.2.3.4" } })).toBe("1.2.3.4");
  });

  test("ignores a spoofed left-most entry", () => {
    // An attacker can prepend a fake IP, but Heroku appends the true peer on the
    // right, so the right-most entry is the trustworthy one.
    expect(connectingIp({ headers: { "x-forwarded-for": "5.5.5.5, 203.0.113.9" } })).toBe("203.0.113.9");
  });

  test("trims whitespace around hops", () => {
    expect(connectingIp({ headers: { "x-forwarded-for": "9.9.9.9 ,  1.2.3.4 " } })).toBe("1.2.3.4");
  });

  test("falls back to the socket address when there is no XFF header", () => {
    expect(connectingIp({ headers: {}, socket: { remoteAddress: "127.0.0.1" } })).toBe("127.0.0.1");
  });
});

describe("matchesBlockedRequest", () => {
  const blocked = [
    ["POST", "/ZOnZmydxUXxdG4q57/Tun"],
    ["POST", "/J00c2DWhLjISI1XOdVV5T3gf4hot5/Tun"],
    ["POST", "/ZOnZmydxUXxdG4q57/Tun/"],
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
    ["GET", "/_next/static/chunks/main.js"],
    ["GET", "/charon/getDataset?prefix=/ncov"],
    ["POST", "/charon/getDataset"],
    ["POST", "/groups/blab/settings/members"],
    ["GET", "/flu/seasonal"],
    ["GET", "/ZOnZmydxUXxdG4q57/Tun"],                                        // right shape, wrong method
    ["POST", "/yo5ITNamz8tKPAVs0K73HA/e6d72660-998f-48dc-b728-b59e00151bfb"], // right shape, wrong method
    ["POST", "/short/Tun"],                                                   // token too short (<8)
    ["GET", "/yo5ITNamz8tKPAVs0K73HA/not-a-uuid"],                            // 2nd segment not a UUID
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
    ["/charon/getDataset", false],
  ])("%s → %s", (path, expected) => {
    expect(isStaticAssetPath(path)).toBe(expected);
  });
});

describe("blockRequests middleware", () => {
  test("passes a legitimate request through", () => {
    const next = jest.fn();
    const res = mockRes();
    blockRequests({ method: "GET", path: "/ncov/gisaid/global/6m" }, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBeUndefined();
  });

  test("rejects a matching request with 403 and closes the connection", () => {
    const next = jest.fn();
    const res = mockRes();
    blockRequests({ method: "POST", path: "/ZOnZmydxUXxdG4q57/Tun" }, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.headers.Connection).toBe("close");
    expect(res.body).toBe("Forbidden\n");
  });
});

describe("blockIps middleware", () => {
  test("rejects a request whose connecting IP is on the committed baseline", () => {
    // 164.215.97.167 is a committed DEFAULT_BLOCKED_IP; the spoofed left-most
    // entry must not save it.
    const next = jest.fn();
    const res = mockRes();
    blockIps({ headers: { "x-forwarded-for": "203.0.113.1, 164.215.97.167" } }, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.headers.Connection).toBe("close");
  });

  test("passes through an unblocked IP", () => {
    const next = jest.fn();
    const res = mockRes();
    blockIps({ headers: { "x-forwarded-for": "8.8.8.8" } }, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBeUndefined();
  });
});
