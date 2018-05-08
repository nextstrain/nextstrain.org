const _ = require("lodash");

export const formatFileName = (name) => {
  const parts = /^\d\d-(.*)/.exec(name);
  if (parts) {
    return _.startCase(parts[1])
  }
  return _.startCase(name)
}
