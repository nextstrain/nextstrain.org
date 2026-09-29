#!/usr/bin/env node
/**
 * Explore Heroku router logs from a Papertrail JSON export: response times,
 * error rates, bottlenecks, bandwidth and abuse signals.
 *
 * Usage:
 *   node scripts/papertrail-explore.js <path-to-papertrail.json> [more.json ...]
 *   node scripts/papertrail-explore.js devData/papertrail/2026-09-29-14.json
 *   node scripts/papertrail-explore.js devData/papertrail/*.json   # via shell glob
 *
 * The export is JSON-lines (one JSON object per line). We only consider Heroku
 * "router" log entries, which carry the request metadata we need under
 * `heroku`: method, path, status, bytes, connectMs, serviceMs, destinationDyno,
 * fwd (the requesting client IP), and — on errors — at/code (e.g. H14, H18).
 * App-log lines are skipped; they carry no structured request fields (and, in
 * particular, no user-agent) so there is nothing extra to extract from them.
 *
 * The report is split into self-contained sections; delete any block you don't
 * need without affecting the others.
 */

import fs from "node:fs";
import readline from "node:readline";

const TOP_N = 8; // how many rows to show in each "top N" listing
const MIN_REQS_FOR_RATE = 20; // ignore low-volume IPs when ranking error rates

// Methods we consider ordinary; anything else is flagged as suspicious.
const STANDARD_METHODS = new Set(["GET", "POST", "HEAD", "PUT", "DELETE", "PATCH", "OPTIONS"]);

// Redirect status codes (3xx that actually redirect; 304 Not Modified is not one).
const REDIRECT_STATUSES = new Set(["301", "302", "303", "307", "308"]);

// Short glosses for the HTTP status codes we're most likely to see in these logs.
const HTTP_STATUS_HELP = {
  200: "OK",
  204: "No Content",
  206: "Partial Content (range request)",
  301: "Moved Permanently",
  302: "Found (redirect)",
  304: "Not Modified (cache hit)",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  429: "Too Many Requests (rate limited)",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

// Short glosses for the Heroku router error codes we're most likely to see.
const HEROKU_CODE_HELP = {
  H10: "app crashed",
  H11: "backlog too deep (dyno request queue overflowed)",
  H12: "request timeout (>30s)",
  H13: "connection closed without response",
  H14: "no web dynos running",
  H15: "idle connection",
  H18: "server request interrupted",
  H27: "client request interrupted",
  H80: "maintenance mode",
};

// ---------------------------------------------------------------------------
// Small stats + formatting helpers
// ---------------------------------------------------------------------------

/** Percentile (0-100) from an ascending-sorted array, linear interpolation. */
function percentile(sorted, p) {
  if (sorted.length === 0) return NaN;
  if (sorted.length === 1) return sorted[0];
  const rank = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (rank - lo);
}

/** Latency summary: n, median (p50) and the p95 slow-tail threshold. */
function summarise(times) {
  const n = times.length;
  if (n === 0) return { n: 0 };
  const sorted = [...times].sort((a, b) => a - b);
  return { n, median: percentile(sorted, 50), slowest95: percentile(sorted, 95) };
}

const fmtMs = (ms) => (Number.isFinite(ms) ? `${ms.toFixed(1)}ms` : "n/a");
const fmtPct = (x) => `${(x * 100).toFixed(1)}%`;
const fmtBytes = (b) => {
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(i === 0 ? 0 : 1)}${u[i]}`;
};

/** Loopback client IPs (IPv4 127.0.0.0/8 and IPv6 ::1) — internal traffic. */
const isLoopback = (ip) => ip === "::1" || ip.startsWith("127.");

/** Print a latency summary line with a label. */
function printSummary(label, s) {
  if (!s.n) {
    console.log(`  ${label.padEnd(30)} (no requests)`);
    return;
  }
  console.log(
    `  ${label.padEnd(30)} n=${String(s.n).padEnd(7)} ` +
      `median (p50)=${fmtMs(s.median).padEnd(10)} ` +
      `95% slowest (p95)=${fmtMs(s.slowest95)}`
  );
}

/** Push a value into a Map<key, array>. */
function pushInto(map, key, value) {
  let arr = map.get(key);
  if (!arr) { arr = []; map.set(key, arr); }
  arr.push(value);
}

/** Increment a Map<key, number> counter. */
function bump(map, key, by = 1) {
  map.set(key, (map.get(key) || 0) + by);
}

/** Top N [key, value] entries of a Map, sorted by a value extractor desc. */
const topEntries = (map, valueOf, n = TOP_N) =>
  [...map.entries()].sort((a, b) => valueOf(b) - valueOf(a)).slice(0, n);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const filePaths = process.argv.slice(2);
  if (filePaths.length === 0) {
    console.error("Usage: node scripts/papertrail-explore.js <path-to-papertrail.json> [more.json ...]");
    process.exit(1);
  }

  // Response-time buckets
  const allService = [];
  const allConnect = [];
  const svcByMethod = new Map();
  const svcByIp = new Map();
  const svcByPath = new Map();

  // Counters
  const statusFamily = new Map(); // "2xx" -> count
  const statusCode = new Map(); // "503" -> count
  const atLevel = new Map(); // info/warning/error -> count
  const herokuCode = new Map(); // H14/H18/... -> count
  const methodCount = new Map();
  const perMinute = new Map(); // "2026-09-29T14:06" -> count

  // Bandwidth
  let totalBytes = 0;

  // Time span covered by the logs (for the monthly egress projection).
  let minTime = Infinity;
  let maxTime = -Infinity;

  // Abuse / errors
  const reqByIp = new Map(); // ip -> total requests
  const errByIp = new Map(); // ip -> 4xx+5xx count
  const notFoundPaths = new Map(); // path -> 404 count
  const redirectPaths = new Map(); // path -> 3xx redirect count
  const suspiciousMethods = new Map(); // method -> count
  const suspiciousMethodIps = new Map(); // method -> Set(ip)

  let totalLines = 0;
  let routerLines = 0;

  for (const filePath of filePaths) {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: "utf8" }),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      totalLines++;

      let entry;
      try { entry = JSON.parse(trimmed); } catch { continue; }

      const h = entry.heroku;
      if (!h || typeof h.serviceMs !== "number" || !h.method) continue; // router only
      routerLines++;

      const service = h.serviceMs;
      const connect = typeof h.connectMs === "number" ? h.connectMs : 0;
      const method = h.method;
      const path = (h.path || "").split("?")[0] || "(none)";
      const status = String(h.status ?? "?");
      const family = /^\d/.test(status) ? `${status[0]}xx` : "?xx";
      const bytes = Number.parseInt(h.bytes, 10) || 0;
      // `fwd` may be a comma-separated proxy chain; the first entry is the client.
      const ip = (h.fwd || "unknown").split(",")[0].trim() || "unknown";
      const minute = (entry.syslog?.timestamp || "").slice(0, 16);
      if (typeof entry.time === "number") {
        if (entry.time < minTime) minTime = entry.time;
        if (entry.time > maxTime) maxTime = entry.time;
      }

      // Response time
      allService.push(service);
      allConnect.push(connect);
      pushInto(svcByMethod, method, service);
      pushInto(svcByIp, ip, service);
      pushInto(svcByPath, path, service);

      // Counters
      bump(statusFamily, family);
      bump(statusCode, status);
      bump(atLevel, h.at || "?");
      if (h.code) bump(herokuCode, h.code);
      bump(methodCount, method);
      if (minute) bump(perMinute, minute);

      // Bandwidth
      totalBytes += bytes;

      // Abuse / errors
      bump(reqByIp, ip);
      const statusNum = Number.parseInt(status, 10);
      if (statusNum >= 400) bump(errByIp, ip);
      if (status === "404") bump(notFoundPaths, path);
      if (REDIRECT_STATUSES.has(status)) bump(redirectPaths, path);
      if (!STANDARD_METHODS.has(method)) {
        bump(suspiciousMethods, method);
        if (!suspiciousMethodIps.has(method)) suspiciousMethodIps.set(method, new Set());
        suspiciousMethodIps.get(method).add(ip);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Report
  // -------------------------------------------------------------------------
  console.log(
    `\nParsed ${totalLines} lines from ${filePaths.length} file(s); ` +
      `${routerLines} router requests with response times.`
  );
  console.log("Response time = Heroku router `service` time (ms).");

  // --- Response time: overall + connect ------------------------------------
  console.log("\n== Response time: overall ==");
  printSummary("service (app response)", summarise(allService));
  printSummary("connect (router->dyno)", summarise(allConnect));

  // --- Response time by method ---------------------------------------------
  console.log("\n== Response time by method ==");
  for (const [method] of topEntries(svcByMethod, (e) => e[1].length, Infinity)) {
    printSummary(method, summarise(svcByMethod.get(method)));
  }

  // --- Response time by path (bottleneck endpoints) ------------------------
  const MIN_REQS_FOR_PATH = 10;
  console.log(`\n== Slowest endpoints (top ${TOP_N} paths by median, >=${MIN_REQS_FOR_PATH} reqs) ==`);
  const slowestPaths = [...svcByPath.entries()]
    .filter(([, times]) => times.length >= MIN_REQS_FOR_PATH)
    .map(([path, times]) => [path, summarise(times)])
    .sort((a, b) => b[1].median - a[1].median)
    .slice(0, TOP_N);
  for (const [path, s] of slowestPaths) {
    printSummary(path, s);
  }

  // --- Status codes --------------------------------------------------------
  console.log("\n== Status codes ==");
  for (const [fam, n] of topEntries(statusFamily, (e) => e[1], Infinity)) {
    console.log(`  ${fam.padEnd(8)} ${String(n).padStart(7)}  (${fmtPct(n / routerLines)})`);
  }
  console.log("  top codes:");
  for (const [code, n] of topEntries(statusCode, (e) => e[1])) {
    console.log(`    ${code.padEnd(6)} ${String(n).padStart(7)}  ${HTTP_STATUS_HELP[code] || ""}`);
  }

  // --- Redirected request paths --------------------------------------------
  console.log(`\n== Top ${TOP_N} redirected request paths (3xx) ==`);
  if (redirectPaths.size === 0) {
    console.log("  none");
  } else {
    for (const [path, n] of topEntries(redirectPaths, (e) => e[1])) {
      console.log(`  ${String(n).padStart(7)}  ${path}`);
    }
  }

  // --- Heroku platform errors (H-codes) ------------------------------------
  console.log("\n== Heroku platform errors (at=error/warning) ==");
  const levelSummary = [...atLevel.entries()].map(([k, v]) => `${k}=${v}`).join("  ");
  console.log(`  levels: ${levelSummary}`);
  if (herokuCode.size === 0) {
    console.log("  no H-codes seen");
  } else {
    for (const [code, n] of topEntries(herokuCode, (e) => e[1], Infinity)) {
      console.log(`  ${code.padEnd(6)} ${String(n).padStart(7)}  ${HEROKU_CODE_HELP[code] || ""}`);
    }
  }

  // --- Throughput over time ------------------------------------------------
  console.log("\n== Throughput ==");
  const [busiestMin, busiestN] = topEntries(perMinute, (e) => e[1], 1)[0] || [];
  if (busiestMin) {
    console.log(`  busiest minute: ${busiestMin}  ${busiestN} req/min`);
  } else {
    console.log("  no timestamps");
  }

  // --- Bandwidth / egress --------------------------------------------------
  console.log("\n== Bandwidth / egress ==");
  console.log(`  total egress: ${fmtBytes(totalBytes)} (${totalBytes} bytes)`);
  const spanMs = maxTime - minTime;
  if (spanMs > 0) {
    const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
    const projected = (totalBytes / spanMs) * MONTH_MS;
    console.log(
      `  observed over ${(spanMs / 3.6e6).toFixed(2)}h  ->  ` +
        `projected ~${fmtBytes(projected)}/month (30d)`
    );
  } else {
    console.log("  (insufficient time span to project monthly egress)");
  }

  // --- Top requesting IPs (with latency) -----------------------------------
  console.log(`\n== Top ${TOP_N} requesting IPs (by request count, loopback excluded) ==`);
  const topIps = topEntries(new Map([...svcByIp].filter(([ip]) => !isLoopback(ip))), (e) => e[1].length);
  for (const [ip] of topIps) {
    printSummary(ip, summarise(svcByIp.get(ip)));
  }

  // --- Abuse signals -------------------------------------------------------
  console.log(`\n== Abuse signals: top IPs by error responses (>=${MIN_REQS_FOR_RATE} reqs, loopback excluded) ==`);
  const errRanked = [...errByIp.entries()]
    .filter(([ip]) => !isLoopback(ip) && (reqByIp.get(ip) || 0) >= MIN_REQS_FOR_RATE)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N);
  if (errRanked.length === 0) {
    console.log("  none");
  } else {
    for (const [ip, errs] of errRanked) {
      const total = reqByIp.get(ip) || 0;
      console.log(`  ${ip.padEnd(24)} ${String(errs).padStart(5)} errors / ${String(total).padStart(5)} reqs  (${fmtPct(errs / total)})`);
    }
  }

  console.log(`\n== Abuse signals: top ${TOP_N} 404 paths (scanning) ==`);
  for (const [path, n] of topEntries(notFoundPaths, (e) => e[1])) {
    console.log(`  ${String(n).padStart(5)}  ${path}`);
  }

  console.log("\n== Abuse signals: non-standard methods ==");
  if (suspiciousMethods.size === 0) {
    console.log("  none");
  } else {
    for (const [method, n] of topEntries(suspiciousMethods, (e) => e[1], Infinity)) {
      const ips = [...(suspiciousMethodIps.get(method) || [])].slice(0, 5).join(", ");
      console.log(`  ${method.padEnd(10)} ${String(n).padStart(5)}  from: ${ips}`);
    }
  }

  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
