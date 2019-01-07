const _ = require("lodash");

export const formatFileName = (name) => {
  /* strip out the YYYY-MM-DD- bit from blog posts for sidebar display but not for the URL */
  const parts = /^\d{4}-\d{2}-\d{2}-(.*)/.exec(name);
  if (parts) {
    return _.startCase(parts[1]);
  }
  return _.startCase(name);
};
