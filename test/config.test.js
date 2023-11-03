import {fromEnvOrConfig} from "../src/config.js";

const env = process.env;

/* Isolate process.env for each test so changes don't leak across tests.
 */
beforeEach(() => {
  process.env = { ...env };
});

/* Reset process.env overrides.
 */
afterEach(() => {
  process.env = env;
});

describe("configurable vs. missing values", () => {
  test("boolean false is a configurable value", () => {
    process.env.TEST_VAR = "false";
    expect(fromEnvOrConfig("TEST_VAR", true)).toBe(false);
  });

  test("numeric 0 is a configurable value", () => {
    process.env.TEST_VAR = "0";
    expect(fromEnvOrConfig("TEST_VAR", 42)).toBe(0);
  });

  test("null is a missing value", async () => {
    process.env.TEST_VAR = "null";
    expect(fromEnvOrConfig("TEST_VAR", "default")).toBe("default");
  });

  test("empty string is a missing value", async () => {
    process.env.TEST_VAR = "";
    expect(fromEnvOrConfig("TEST_VAR", "default")).toBe("default");
  });
});
