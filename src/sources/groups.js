/* eslint no-use-before-define: ["error", {"functions": false, "classes": false}] */
const authz = require("../authz");
const {Group, GROUP_RECORDS} = require("../groups");
const {S3Source, PrivateS3Source} = require("./s3");


const GroupSource = (name) => {
  const group = new Group(name);

  const BaseSource = group.isPublic
    ? PublicGroupSource
    : PrivateGroupSource;

  // eslint-disable-next-line no-shadow
  return class GroupSource extends BaseSource {
    static get _name() { return group.name; }
    get bucket() { return group.bucket; }
  };
};


class PublicGroupSource extends S3Source {
  static isGroup() {
    return true;
  }

  get authzPolicy() {
    return [
      ...authzPolicy(this.name),

      /* No role restriction on reading anything tagged "public".
       */
      {tag: authz.tags.Visibility.Public, role: "*", allow: [authz.actions.Read]},
    ];
  }

  get authzTags() {
    return new Set([
      authz.tags.Type.Source,
      authz.tags.Visibility.Public,
    ]);
  }
  get authzTagsToPropagate() {
    return new Set([
      authz.tags.Visibility.Public,
    ]);
  }
}


class PrivateGroupSource extends PrivateS3Source {
  static isGroup() {
    return true;
  }

  get authzPolicy() {
    return authzPolicy(this.name);
  }
}


/**
 * Generate the authorization policy for a given Nextstrain Group.
 *
 * Currently generated from a statically-defined policy template, but in the
 * future could retrieve a per-group, owner-defined, stored policy which makes
 * use of both system- and user-defined tags and roles.
 *
 * @param {string} groupName - Name of the Nextstrain Group
 * @returns {authzPolicy}
 */
function authzPolicy(groupName) {
  const {Read, Write} = authz.actions;
  const {Type} = authz.tags;

  return [
    /* eslint-disable no-multi-spaces */

    /* All membership roles in a Nextstrain Group can see information about the
     * group Source instance.
     */
    {tag: Type.Source, role: `${groupName}/viewers`, allow: [Read]},
    {tag: Type.Source, role: `${groupName}/editors`, allow: [Read]},
    {tag: Type.Source, role: `${groupName}/owners`,  allow: [Read]},

    /* Editors and Owners can create/update/delete datasets and narratives, but
     * Viewers can only see them.
     */
    {tag: Type.Dataset, role: `${groupName}/viewers`, allow: [Read]},
    {tag: Type.Dataset, role: `${groupName}/editors`, allow: [Read, Write]},
    {tag: Type.Dataset, role: `${groupName}/owners`,  allow: [Read, Write]},

    {tag: Type.Narrative, role: `${groupName}/viewers`, allow: [Read]},
    {tag: Type.Narrative, role: `${groupName}/editors`, allow: [Read, Write]},
    {tag: Type.Narrative, role: `${groupName}/owners`,  allow: [Read, Write]},

    /* eslint-enable no-multi-spaces */
  ];
}

const groupSources = Array.from(GROUP_RECORDS.values())
  .map(groupRecord => GroupSource(groupRecord.name));

module.exports = {
  GroupSource,
  groupSources,
};
