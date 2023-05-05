import { validateGroupName, assertValidGroupName, normalizeGroupName } from '../src/groups.js';

describe("validate", () => {
  const repeat = (str, n) => Array(n+1).join(str);

  const names = [
    ["foo-bar", {ok: true}],
    ["foo/bar", {ok: false, msg: expect.stringMatching(/disallowed char/)}],
    ["foobar/", {ok: false, msg: expect.stringMatching(/disallowed char/)}],
    ["blаb",    {ok: false, msg: expect.stringMatching(/disallowed char/)}],
    //  ^ that's U+0430 ‹а› \N{CYRILLIC SMALL LETTER A}
    //       not U+0061 ‹a› \N{LATIN SMALL LETTER A}

    ["1",   {ok: false, msg: expect.stringMatching(/too short/)}],
    ["12",  {ok: false, msg: expect.stringMatching(/too short/)}],
    ["123", {ok: true}],

    [repeat("x", 50), {ok: true}],
    [repeat("x", 51), {ok: false, msg: expect.stringMatching(/too long/)}],
  ];

  test.each(names)("%s → %s", (name, expected) => {
    expect(validateGroupName(name))
      .toEqual(expected);

    const expectedError = expected.msg?.sample ?? expected.msg;
    const expectAssert = expect(() => assertValidGroupName(name));
    if (expected.ok) {
      expectAssert.not.toThrow();
    } else {
      expectAssert.toThrow(expectedError);
    }
  });
});

describe("normalize", () => {
  const names = [
    ["FOO", "foo"],
    ["FOObar", "foobar"],
    ["foo-BAR", "foo-bar"],
    ["nextﬂu", "nextflu"],
  ];

  test.each(names)("%s → %s", (given, expected) => {
    expect(normalizeGroupName(given))
      .toEqual(expected);
  });
});
