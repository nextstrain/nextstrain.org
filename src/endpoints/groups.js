import * as authz from "../authz/index.js";
import { Group } from "../groups.js";


const setGroup = (nameExtractor) => (req, res, next) => {
  const group = new Group(nameExtractor(req));

  authz.assertAuthorized(req.user, authz.actions.Read, group);

  req.context.group = group;
  return next();
};


export {
  setGroup,
};
