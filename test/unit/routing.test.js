const {isRequestBackedByAuspiceDataset} = require("../../src/auspicePaths.js");

jest.setTimeout(10000);

/** The server assumes some globals are set. These will hopefully be removed in the future. */
global.availableDatasets = {
  secondTreeOptions: {},
  defaults: {}
};

/* NOTE
`isRequestBackedByAuspiceDataset` only runs if the request does not match a static asset..
*/
describe('Check requests are handled by Auspice or Gatsby', () => {
  const auspicePaths = [
    /* CORE datasets which (normally) exist */
    "/zika",
    "/flu/seasonal/h3n2/ha/3y",
    /* STAGING datasets which (normally) exist */
    "/staging/zika",
    "/staging/flu/seasonal/h3n2/ha/3y",
    // Following have not yet been extended to be handled through Gatsby
    // So we preserve previous behavior and let auspice handle them
    "/groups/blab",
    "/groups",
    "/community/org/repo",
    "/narratives/x",
    "/fetch/x"
  ];

  const gatsbyPaths = [
    /* CORE datasets which don't (normally) exist */
    "/zika/no",
    "/flu/h3n2/ha/3y", // missing "seasonal"
    "/ncov/antartica",
    /* STAGING datasets which don't exist are handled by Gatsby */
    "/staging/not-a-dataset"
  ];

  for (let i=0; i<auspicePaths.length; i++) {
    test(`Test that ${auspicePaths[i]} is routed towards Auspice`, async () => { // eslint-disable-line no-await-in-loop
      const [req, res, next]= [{path: auspicePaths[i]}, {}, () => {}];
      await isRequestBackedByAuspiceDataset(req, res, next); // eslint-disable-line no-await-in-loop
      expect(req.sendToAuspice).toBe(true);
    });
  }
  for (let i=0; i<gatsbyPaths.length; i++) {
    test(`Test that ${gatsbyPaths[i]} is routed towards Gatsby`, async () => { // eslint-disable-line no-await-in-loop
      const [req, res, next]= [{path: gatsbyPaths[i]}, {}, () => {}];
      await isRequestBackedByAuspiceDataset(req, res, next); // eslint-disable-line no-await-in-loop
      expect(req.sendToAuspice).toBe(false);
    });
  }
});

