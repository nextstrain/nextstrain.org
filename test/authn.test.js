import {jest} from '@jest/globals';
import Benchmark from 'benchmark';
import { randomKey } from '../src/cryptography.js';

const env = process.env;

/* Allow each test() to import() modules separately so we can explicitly test
 * require-time behaviours.
 *
 * Isolate process.env for each test so changes don't leak across tests.
 */
beforeEach(() => {
  jest.resetModules();
  process.env = { ...env };
});

/* Reset process.env overrides.
 */
afterEach(() => {
  process.env = env;
});


test("SESSION_ENCRYPTION_KEYS required in production", async () => {
  process.env.NODE_ENV = "production";
  process.env.SESSION_SECRET = "not a secret";
  delete process.env.SESSION_ENCRYPTION_KEYS;

  await expect(async () => await import("../src/authn/session"))
    .rejects
    .toThrow("SESSION_ENCRYPTION_KEYS required in production");

  process.env.SESSION_ENCRYPTION_KEYS = `a=${randomKey()}`;

  await expect(async () => await import("../src/authn/session"))
    .toBeDefined();
});


test("roundtrip encrypted tokens", async () => {
  const {getTokens, setTokens, deleteTokens} = await import("../src/authn/session");

  const session = {
    id: "0xABADCAFE",
  };

  await expect(getTokens(session))
    .resolves.toBeNull();

  // Set when prior values don't exist
  await setTokens(session, {
    idToken: "foo",
    accessToken: "bar",
    refreshToken: "baz",
    otherToken: "bam",
  });

  await expect(getTokens(session))
    .resolves.toEqual({
      idToken: "foo",
      accessToken: "bar",
      refreshToken: "baz",
      // no otherToken
    });

  // Set again when prior values do exist
  await setTokens(session, {
    idToken: "id",
    accessToken: "access",
    refreshToken: "refresh",
    otherToken: "other",
  });

  await expect(getTokens(session))
    .resolves.toEqual({
      idToken: "id",
      accessToken: "access",
      refreshToken: "refresh",
      // no otherToken
    });

  await deleteTokens(session);

  await expect(getTokens(session))
    .resolves.toBeNull();
});


test("session id must match", async () => {
  const {getTokens, setTokens} = await import("../src/authn/session");

  const session = {
    id: "0xABADCAFE",
  };

  await setTokens(session, {
    idToken: "foo",
    accessToken: "bar",
    refreshToken: "baz",
    otherToken: "bam",
  });

  /* Change session id, mimicking the encrypted tokens being copied from their
   * original session to another.
   */
  session.id = "0x8BADF00D";

  await expect(getTokens(session))
    .rejects
    .toThrow("encrypted message context does not match decryption context");
});


test("benchmark", async () => {
  const {getTokens, setTokens} = await import("../src/authn/session");

  const session = {
    id: "0xABADCAFE",
  };

  const tokens = {
    idToken: "foo",
    accessToken: "bar",
    refreshToken: "baz",
  };

  const setBenchmark = await bench(async () => {
    await setTokens(session, tokens);
  });
  expect(setBenchmark.times.period)
    .toBeLessThan(2 / 1000); // 2ms

  const getBenchmark = await bench(async () => {
    await getTokens(session);
  });
  expect(getBenchmark.times.period)
    .toBeLessThan(2 / 1000); // 2ms
});


async function bench(fn) {
  return await new Promise((resolve, reject) => {
    const benchmark = new Benchmark({
      defer: true,
      fn: async (deferred) => {
        await fn();
        deferred.resolve();
      },
      onComplete: event => resolve(event.target),
      onError: reject,
      maxTime: 1, // 1s
    });

    benchmark.run();
  });
}
