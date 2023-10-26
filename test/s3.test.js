import { jest } from "@jest/globals";
import { Group } from "../src/groups.js";


afterEach(() => {
  jest.restoreAllMocks();
});


test("signed URLs are temporally stable and thus cacheable", async () => {
  const blab = new Group("blab");

  const narrativeMarkdown =
    blab.source
      .narrative("test/fixture".split("/"))
      .subresource("md");

  const now = jest.spyOn(Date, "now");
  const time = 1697737617069; // Thu Oct 19 10:46:57.069 2023 America/Los_Angeles

  now.mockReturnValue(time);
  const url1 = await narrativeMarkdown.url();

  now.mockReturnValue(time + 10 * 60 * 1000); // 10 minutes later (in ms)
  const url2 = await narrativeMarkdown.url();

  now.mockReturnValue(time + 120 * 60 * 1000); // 120 minutes (2 hours) later (in ms)
  const url3 = await narrativeMarkdown.url();

  expect(url1).toStrictEqual(url2);
  expect(url1).not.toStrictEqual(url3);
});
