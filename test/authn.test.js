const {randomKey} = require("../src/cryptography");


/* Allow each test() to require() modules separately so we can explicitly test
 * require-time behaviours.
 */
/* eslint-disable global-require */
beforeEach(() => {
  jest.resetModules();
});


test("SESSION_ENCRYPTION_KEYS required in production", () => {
  process.env.NODE_ENV = "production";

  expect(() => require("../src/authn/session"))
    .toThrow("SESSION_ENCRYPTION_KEYS required in production");

  process.env.SESSION_ENCRYPTION_KEYS = `a=${randomKey()}`;

  expect(() => require("../src/authn/session"))
    .toBeDefined();
});


test("roundtrip encrypted tokens", async () => {
  const {getTokens, setTokens, deleteTokens} = require("../src/authn/session");

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
  const {getTokens, setTokens} = require("../src/authn/session");

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
