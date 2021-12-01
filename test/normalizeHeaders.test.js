const {normalizeHeaders} = require("../src/utils");

/* eslint-disable indent */
const cases = [
  [{"Content-Type": "foo", "CONTENT-ENCODING": "bar"},
   {"content-type": "foo", "content-encoding": "bar"}],

  [{"content-type": "foo", "content-encoding": undefined},
   {"content-type": "foo"}],

  [{"content-type": "foo", "content-encoding": null},
   {"content-type": "foo"}],

  [{"content-type": "foo", "content-encoding": ""},
   {"content-type": "foo"}],

  [{"content-type": null},
   {}],

  [{},
   {}],
];
/* eslint-enable indent */

test.each(cases)("%o → %o", (given, expected) => {
  expect(normalizeHeaders(given)).toStrictEqual(expected);
});
