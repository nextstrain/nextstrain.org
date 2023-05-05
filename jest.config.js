export default {
  /* Run tests in a normal Node environment, not a fake browser (JSDOM)
   * environment.  This is a Node app after all.  But this also fixes an
   * long-known issue where Jest breaks the Node stdlib by providing a Buffer
   * that's not a subclass of Uint8Array, see:
   *
   *    https://github.com/facebook/jest/issues/4422
   *
   * This subclass relationship is relied on by many things dealing with
   * Buffers and typed arrays, including the @aws-crypto/… libraries.
   *
   * A suggested workaround from the issue discussion is to add:
   *
   *    globals: {"Uint8Array": Uint8Array}
   *
   * to the Jest config, and at first this appears to work if you run a single
   * affected test file.  However, it doesn't work when running multiple test
   * files unless the --runInBand option is also used, implicating the worker
   * subprocess system.
   *
   * The Jest config docs give a clue here:
   *
   *    In addition, the globals object must be json-serializable, so it can't
   *    be used to specify global functions…
   *
   * This means the workaround above shouldn't be expected to work at all, even
   * though it happens to work for single test files (presumably because
   * they're run in the same process and thus skip serialization so the value
   * is preserved?).
   *
   * Adding to the confusion, Node is the default testEnvironment for recent
   * versions of Jest (at least 28.x), but not the version we're using here
   * (26.x).  Being explicit won't hurt when we upgrade, but this difference
   * led me astray for a bit.
   *   -trs, 20 May 2022
   */
  testEnvironment: "node",
  testMatch: [
    "**/*.test.js"
  ],
  globals: {
    BASE_URL: "http://localhost:5000"
  },
  setupFilesAfterEnv: [
    "jest-extended/all"
  ]
};
