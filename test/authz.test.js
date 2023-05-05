import yaml from 'js-yaml';
import * as authz from '../src/authz/index.js';
import { AuthzDenied } from '../src/exceptions.js';
import * as json from '../src/json.js';
import { CoreSource, GroupSource } from '../src/sources/index.js';

const {Read, Write} = authz.actions;
const {Type, Visibility} = authz.tags;

const coreSource = new CoreSource();
const coreDataset = coreSource.dataset(["example"]);
const coreNarrative = coreSource.narrative(["example"]);

const testSource = new GroupSource("test");
const testDataset = testSource.dataset(["example"]);
const testNarrative = testSource.narrative(["example"]);

const testPrivateSource = new GroupSource("test-private");
const testPrivateDataset = testPrivateSource.dataset(["example"]);
const testPrivateNarrative = testPrivateSource.narrative(["example"]);


// Check that main authz functions + built-in policies work as expected.
describe("authz.authorized() and .assertAuthorized()", () => {
  const cases = [
    // Core
    [[null, Read,  coreSource],     true],
    [[null, Read,  coreDataset],    true],
    [[null, Read,  coreNarrative],  true],
    [[null, Write, coreSource],     false],
    [[null, Write, coreDataset],    false],
    [[null, Write, coreNarrative],  false],

    // A public group
    [[null, Read,  testSource],     true],
    [[null, Read,  testDataset],    true],
    [[null, Read,  testNarrative],  true],
    [[null, Write, testSource],     false],
    [[null, Write, testDataset],    false],
    [[null, Write, testNarrative],  false],

    [[mockUser(["wrong/owners"]), Read,  testSource],     true],
    [[mockUser(["wrong/owners"]), Read,  testDataset],    true],
    [[mockUser(["wrong/owners"]), Read,  testNarrative],  true],
    [[mockUser(["wrong/owners"]), Write, testSource],     false],
    [[mockUser(["wrong/owners"]), Write, testDataset],    false],
    [[mockUser(["wrong/owners"]), Write, testNarrative],  false],

    [[mockUser(["test/viewers"]), Read,  testSource],     true],
    [[mockUser(["test/viewers"]), Read,  testDataset],    true],
    [[mockUser(["test/viewers"]), Read,  testNarrative],  true],
    [[mockUser(["test/viewers"]), Write, testSource],     false],
    [[mockUser(["test/viewers"]), Write, testDataset],    false],
    [[mockUser(["test/viewers"]), Write, testNarrative],  false],

    [[mockUser(["test/editors"]), Read,  testSource],     true],
    [[mockUser(["test/editors"]), Read,  testDataset],    true],
    [[mockUser(["test/editors"]), Read,  testNarrative],  true],
    [[mockUser(["test/editors"]), Write, testSource],     false],
    [[mockUser(["test/editors"]), Write, testDataset],    true],
    [[mockUser(["test/editors"]), Write, testNarrative],  true],

    [[mockUser(["test/owners"]),  Read,  testSource],     true],
    [[mockUser(["test/owners"]),  Read,  testDataset],    true],
    [[mockUser(["test/owners"]),  Read,  testNarrative],  true],
    [[mockUser(["test/owners"]),  Write, testSource],     false],
    [[mockUser(["test/owners"]),  Write, testDataset],    true],
    [[mockUser(["test/owners"]),  Write, testNarrative],  true],

    // A private group
    [[null, Read,  testPrivateSource],    false],
    [[null, Read,  testPrivateDataset],   false],
    [[null, Read,  testPrivateNarrative], false],
    [[null, Write, testPrivateSource],    false],
    [[null, Write, testPrivateDataset],   false],
    [[null, Write, testPrivateNarrative], false],

    [[mockUser(["wrong/owners"]), Read,  testPrivateSource],     false],
    [[mockUser(["wrong/owners"]), Read,  testPrivateDataset],    false],
    [[mockUser(["wrong/owners"]), Read,  testPrivateNarrative],  false],
    [[mockUser(["wrong/owners"]), Write, testPrivateSource],     false],
    [[mockUser(["wrong/owners"]), Write, testPrivateDataset],    false],
    [[mockUser(["wrong/owners"]), Write, testPrivateNarrative],  false],

    [[mockUser(["test-private/viewers"]), Read,  testPrivateSource],     true],
    [[mockUser(["test-private/viewers"]), Read,  testPrivateDataset],    true],
    [[mockUser(["test-private/viewers"]), Read,  testPrivateNarrative],  true],
    [[mockUser(["test-private/viewers"]), Write, testPrivateSource],     false],
    [[mockUser(["test-private/viewers"]), Write, testPrivateDataset],    false],
    [[mockUser(["test-private/viewers"]), Write, testPrivateNarrative],  false],

    [[mockUser(["test-private/editors"]), Read,  testPrivateSource],     true],
    [[mockUser(["test-private/editors"]), Read,  testPrivateDataset],    true],
    [[mockUser(["test-private/editors"]), Read,  testPrivateNarrative],  true],
    [[mockUser(["test-private/editors"]), Write, testPrivateSource],     false],
    [[mockUser(["test-private/editors"]), Write, testPrivateDataset],    true],
    [[mockUser(["test-private/editors"]), Write, testPrivateNarrative],  true],

    [[mockUser(["test-private/owners"]),  Read,  testPrivateSource],     true],
    [[mockUser(["test-private/owners"]),  Read,  testPrivateDataset],    true],
    [[mockUser(["test-private/owners"]),  Read,  testPrivateNarrative],  true],
    [[mockUser(["test-private/owners"]),  Write, testPrivateSource],     false],
    [[mockUser(["test-private/owners"]),  Write, testPrivateDataset],    true],
    [[mockUser(["test-private/owners"]),  Write, testPrivateNarrative],  true],
  ];

  /* Jest's test.each() makes it really hard to get reasonable test names, so
   * build one ourselves first.
   */
  const caseName = ([user, action, object], result) => `
    user=${user && dump(user)}
    action=${action.description}
    object=${object.constructor.name}
    → ${result}
  `.trim().replace(/\s+/g, " ");

  const namedCases = cases.map(c => [caseName(...c), ...c]);

  test.each(namedCases)("%s", (name, ...c) => expectAuthorized(...c));
});


// Check range of policy handling.
describe("authz.evaluatePolicy()", () => {
  const allows = x => expect(x).toBe(true);
  const denies = x => expect(x).toBe(false);

  const set = (...values) => new Set(values);
  const roles = set;
  const tags = set;

  test("empty policy", () =>
    denies(authz.evaluatePolicy([], roles(), Read, tags())));

  test("empty allow", () =>
    denies(authz.evaluatePolicy([{tag: "*", role: "*", allow: []}], roles("test/viewers"), Read, tags(Type.Dataset))));

  test("multiple matching rules", () => {
    const policy = [
      {tag: "*", role: "test/viewers", allow: [Read]},
      {tag: "*", role: "test/viewers", allow: [Write]},
    ];

    denies(authz.evaluatePolicy(policy, roles(), Read, tags()));
    denies(authz.evaluatePolicy(policy, roles(), Write, tags()));

    allows(authz.evaluatePolicy(policy, roles("test/viewers"), Read, tags()));
    allows(authz.evaluatePolicy(policy, roles("test/viewers"), Write, tags()));
  });

  test("multiple matching roles", () => {
    const policy = [
      {tag: "*", role: "test/viewers", allow: [Read]},
      {tag: "*", role: "test-private/viewers", allow: [Write]},
    ];

    denies(authz.evaluatePolicy(policy, roles(), Read, tags()));
    denies(authz.evaluatePolicy(policy, roles(), Write, tags()));

    allows(authz.evaluatePolicy(policy, roles("test/viewers"), Read, tags()));
    denies(authz.evaluatePolicy(policy, roles("test/viewers"), Write, tags()));

    denies(authz.evaluatePolicy(policy, roles("test-private/viewers"), Read, tags()));
    allows(authz.evaluatePolicy(policy, roles("test-private/viewers"), Write, tags()));

    allows(authz.evaluatePolicy(policy, roles("test/viewers", "test-private/viewers"), Read, tags()));
    allows(authz.evaluatePolicy(policy, roles("test/viewers", "test-private/viewers"), Write, tags()));
  });

  test("multiple matching tags", () => {
    const policy = [
      {tag: Visibility.Public, role: "*", allow: [Read]},
      {tag: Type.Dataset, role: "*", allow: [Write]},
    ];

    denies(authz.evaluatePolicy(policy, roles(), Read, tags()));
    denies(authz.evaluatePolicy(policy, roles(), Write, tags()));

    allows(authz.evaluatePolicy(policy, roles(), Read, tags(Visibility.Public)));
    denies(authz.evaluatePolicy(policy, roles(), Write, tags(Visibility.Public)));

    allows(authz.evaluatePolicy(policy, roles(), Read, tags(Visibility.Public, Type.Dataset)));
    allows(authz.evaluatePolicy(policy, roles(), Write, tags(Visibility.Public, Type.Dataset)));
  });
});


function mockUser(roles) {
  return {
    authzRoles: new Set(roles),
  };
}

function expectAuthorized([user, action, object], result) {
  expect(authz.authorized(user, action, object))
    .toBe(result);

  const expectAssert = expect(() => authz.assertAuthorized(user, action, object));
  if (result === false) {
    expectAssert.toThrow(AuthzDenied);
  } else {
    expectAssert.not.toThrow();
  }
}

function dump(data) {
  return yaml.dump(data, {
    // compact single line
    flowLevel: 0,
    lineWidth: -1,

    // serialize Sets as arrays
    replacer: json.replacer
  });
}
