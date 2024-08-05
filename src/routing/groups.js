import * as endpoints from '../endpoints/index.js';
import { NotFound } from '../httpErrors.js';
import { uri } from '../templateLiterals.js';
import { GroupSource } from '../sources/index.js';


const {
  setSource,
  setDataset,
  setNarrative,
  getDataset,
  putDataset,
  deleteDataset,
  optionsDataset,
  getNarrative,
  putNarrative,
  deleteNarrative,
  optionsNarrative,
} = endpoints.sources;

const {
  optionsGroup,
  getGroupLogo,
  putGroupLogo,
  deleteGroupLogo,
  getGroupOverview,
  putGroupOverview,
  deleteGroupOverview,
} = endpoints.groups;


/** Add Groups-related routes.
 */
export function setup(app) {
  app.use("/groups/:groupName",
    setSource(req => new GroupSource(req.params.groupName)),

    // Canonicalize the Group name.
    (req, res, next) => {
      const restOfUrl = req.url !== "/" ? req.url : "";

      const canonicalName = req.context.source.group.name;
      const canonicalUrl = uri`/groups/${canonicalName}` + restOfUrl;

      return req.params.groupName !== canonicalName
        ? res.redirect(canonicalUrl)
        : next();
    });

  app.routeAsync("/groups/:groupName")
    .getAsync(endpoints.nextJsApp.handleRequest)

  app.use("/groups/:groupName/settings",
    endpoints.groups.setGroup(req => req.params.groupName));

  app.routeAsync("/groups/:groupName/settings")
    .getAsync(endpoints.nextJsApp.handleRequest)

  app.routeAsync("/groups/:groupName/settings/logo")
    .getAsync(getGroupLogo)
    .putAsync(putGroupLogo)
    .deleteAsync(deleteGroupLogo)
    .optionsAsync(optionsGroup)
    ;

  app.routeAsync("/groups/:groupName/settings/overview")
    .getAsync(getGroupOverview)
    .putAsync(putGroupOverview)
    .deleteAsync(deleteGroupOverview)
    .optionsAsync(optionsGroup)
    ;

  app.routeAsync("/groups/:groupName/settings/members")
    .getAsync(endpoints.groups.listMembers)
    .optionsAsync(optionsGroup)
    ;

  app.routeAsync("/groups/:groupName/settings/roles")
    .getAsync(endpoints.groups.listRoles)
    .optionsAsync(optionsGroup)
    ;

  app.routeAsync("/groups/:groupName/settings/roles/:roleName/members")
    .getAsync(endpoints.groups.listRoleMembers)
    .optionsAsync(optionsGroup)
    ;

  app.routeAsync("/groups/:groupName/settings/roles/:roleName/members/:username")
    .getAsync(endpoints.groups.getRoleMember)
    .putAsync(endpoints.groups.putRoleMember)
    .deleteAsync(endpoints.groups.deleteRoleMember)
    .optionsAsync(optionsGroup)
    ;

  app.route("/groups/:groupName/settings/*")
    .all(() => { throw new NotFound(); });

  // Avoid matching "narratives" as a dataset name.
  app.routeAsync("/groups/:groupName/narratives")
    .getAsync((req, res) => res.redirect(uri`/groups/${req.params.groupName}`));

  app.routeAsync("/groups/:groupName/narratives/*")
    .all(setNarrative(req => req.params[0]))
    .getAsync(getNarrative)
    .putAsync(putNarrative)
    .deleteAsync(deleteNarrative)
    .optionsAsync(optionsNarrative)
    ;

  app.routeAsync("/groups/:groupName/*")
    .all(setDataset(req => req.params[0]))
    .getAsync(getDataset)
    .putAsync(putDataset)
    .deleteAsync(deleteDataset)
    .optionsAsync(optionsDataset)
    ;


  /* Users
   */
  app.routeAsync("/whoami")
    .getAsync(endpoints.users.getWhoami);

  /* For requests for text/html, the first /whoami implementation returned bare
   * bones HTML dynamic on the logged in user.  This was later replaced by a
   * redirect to /users/:name (for a logged in session) or /users (if no one
   * logged in), which then rendered a static-site page.  However, the /users/:name
   * form was purely aesthetic: :name was not used for routing at all.  Instead
   * of keeping up this fiction, have /whoami render the static-site page directly,
   * at least until we _actually_ implement user profile pages.
   *   -trs, 4 Oct 2021
   */
  app.route(["/users", "/users/:name"])
    .get((req, res) => res.redirect("/whoami"));
}
