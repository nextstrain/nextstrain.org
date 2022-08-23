import { strict as assert } from 'assert';
import * as authz from "./authz/index.js";
import { NotFound } from './httpErrors.js';

/* eslint-disable-next-line import/first, import/newline-after-import */
import { readFile } from 'fs/promises';
const GROUPS_DATA = JSON.parse(await readFile(new URL('../data/groups.json', import.meta.url)));

const PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Map of Nextstrain Groups from their (normalized) name to their static config
 * record.
 *
 * This essentially takes the place of what might be a database table in the
 * future but is perfectly fine as a flat file key-value store for now.
 */
const GROUP_RECORDS = new Map(
  GROUPS_DATA
    /* Groups for dev/testing.  Might be nice to expose these in production too,
     * but we'd need additional changes first to support "unlisted" Groups.
     *   -trs, 24 Jan 2022
     * */
    .filter(groupRecord => PRODUCTION ? !groupRecord.isDevOnly : true)
    .map(groupRecord => [normalizeGroupName(groupRecord.name), groupRecord])
);

/* Check names for uniqueness after normalization.
 */
{
  const names = GROUPS_DATA.map(g => normalizeGroupName(g.name));
  assert(names.length === (new Set(names)).size);
}


/**
 * Data model class representing a Nextstrain Group.
 */
class Group {
  constructor(name) {
    const groupRecord = GROUP_RECORDS.get(normalizeGroupName(name));

    if (!groupRecord) throw new NotFound(`unknown group: ${name}`);

    /**
     * Name of this Group.
     * @type {String}
     */
    this.name = groupRecord.name;
    assertValidGroupName(this.name);

    /**
     * Is this Group public (e.g. readable by all)?
     *
     * Defaults to `false` unless the underlying record is `true`.
     *
     * @type {Boolean}
     */
    this.isPublic = groupRecord.isPublic === true;

    /**
     * S3 bucket for this Group.
     *
     * For early access groups which each used their own bucket instead of
     * occupying a single multi-tentant bucket.
     *
     * @type {String}
     */
    this.bucket = groupRecord.bucket;

    /**
     * Map of generic roles a member of this Group can hold to fully-qualified
     * authz roles.
     *
     * The fully-qualified names are used in authz policies, and a user's authz
     * roles are stored using membership in AWS Cognito groups of the same
     * name.
     *
     * @type {Map.<string, string>}
     */
    this.membershipRoles = new Map([
      ["viewers", `${this.name}/viewers`],
      ["editors", `${this.name}/editors`],
      ["owners", `${this.name}/owners`],
    ]);
  }


  /**
   * Policy for this Group itself.  Separate from the policy for the group's
   * Source, which is the container for the group's datasets and narratives.
   */
  get authzPolicy() {
    const {Read, Write} = authz.actions;
    const {Type} = authz.tags;

    const viewers = this.membershipRoles.get("viewers");
    const editors = this.membershipRoles.get("editors");
    const owners = this.membershipRoles.get("owners");

    return [
      /* All membership roles in a Nextstrain Group can see information about
       * the group itself (e.g. members, role names, etc.), but only owners can
       * update it.  Note that the datasets and narratives within the group are
       * authz'd separately on the GroupSource.
       */
      {tag: Type.Group, role: viewers, allow: [Read]},
      {tag: Type.Group, role: editors, allow: [Read]},
      {tag: Type.Group, role: owners, allow: [Read, Write]},
    ];
  }

  get authzTags() {
    return new Set([authz.tags.Type.Group]);
  }
}


/**
 * Asserts the given group name is valid based on the rules for Groups.
 *
 * Throws an Error if invalid; otherwise returns nothing.
 *
 * @param {string} name
 * @throws {Error}
 */
function assertValidGroupName(name) {
  const {ok, msg} = validateGroupName(name);
  if (!ok) throw new Error(`invalid group name: ${msg}`);
}


/**
 * Validate a group name based on the rules for Groups.
 *
 * Group names are restricted because there are several places that by design
 * mix user input (the group name) with system input (e.g. the /role suffix in
 * Cognito role groups and in the keys of multi-tenant storage).
 *
 * Note that this does not check for existence of the group.
 *
 * @param {string} name
 * @returns {{ok: boolean, msg: string}} result
 */
function validateGroupName(name) {
  assert(typeof name === "string", "name is a string");

  /* XXX TODO: This does not include many Unicode characters people may
   * legitimately want in order to accurately represent their group names—we
   * should strive to allow accented characters and non-Roman alphabet
   * languages in the future—but the restriction has the immediate benefit of
   * sidestepping issues of intentional confusion and impersonation via
   * visually similar but distinct characters, e.g.:
   *
   *    blab    U+0062 U+006C U+0061 U+0062    LATIN SMALL LETTER A
   *    blаb    U+0062 U+006C U+0430 U+0062    CYRILLIC SMALL LETTER A
   *
   * Such characters are often called "confusables" or "homoglyphs".  Note that
   * NFKC normalization is not sufficient; these two characters are still
   * distinct after normalization.
   *
   * By starting more restrictive, we can always carefully allow other
   * characters in the future as necessary.
   *   -trs, 17 Feb 2022
   */
  if (/[^a-zA-Z0-9-]/.test(name)) {
    return {ok: false, msg: "disallowed characters (must contain only ASCII upper- and lowercase letters (A-Z), digits (0-9), and hyphens (-))"};
  }

  if (name.length <  3) return {ok: false, msg: "too short (must be at least 3 characters)"};     // eslint-disable-line no-multi-spaces
  if (name.length > 50) return {ok: false, msg: "too long (must be no more than 50 characters)"};

  /* XXX TODO: This validation is sufficient to prevent us from accidentally
   * making a hazard re: storage, authz, and routing, but not sufficient to
   * open up self-serve Group creation.  Before we do that (if we ever do),
   * we'll want to consider fuzzy matching on forbidden words that are
   *
   *  - potentially offensive?  curated, open-licensed lists exist.
   *
   *  - potentially misleading, e.g. random people probably shouldn't be able
   *    to put "nextstrain" or variations in their group name (at least without
   *    manual approval)?  also maybe extends to WHO, CDC, PAHO, etc?
   *
   * Or maybe this won't come to pass and we'll always have a manual approval
   * step for new Groups?  That's not so unreasonable.
   *   -trs, 17 Feb 2022
   */

  return {ok: true};
}


/**
 * Normalize a group name.
 *
 * Note that a normalized name is not necessarily a valid name and vice versa;
 * they are orthogonal (and intersecting) checks.  In particular, note that
 * normalization does not address the issue of visually confusing/misleading
 * characters.
 *
 * @param {string} name
 * @returns {string} Name converted to Unicode Normalization Form NFKC and
 *   lowercased in en-US.
 */
function normalizeGroupName(name) {
  return name.normalize("NFKC").toLocaleLowerCase("en-US");
}


/**
 * Group objects for all Nextstrain Groups.
 *
 * I expect this to go away once our groups are defined in a database (or other
 * dynamic datastore) instead of a static file.  Code that needs a listing of
 * all groups will then query it at runtime instead of consulting a predefined
 * array, for reasons of freshness and size in memory.
 *   -trs, 15 Feb 2022
 *
 * @type {Group[]}
 */
const ALL_GROUPS = Array.from(GROUP_RECORDS.keys())
  .map(name => new Group(name));


export {
  Group,
  assertValidGroupName,
  validateGroupName,
  normalizeGroupName,
  ALL_GROUPS,
};
