const {NotFound} = require("http-errors");

const GROUPS_DATA = require("../data/groups.json");

const PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Map of Nextstrain Groups from their name to their static config record.
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
    .map(groupRecord => [groupRecord.name, groupRecord])
);


/**
 * Data model class representing a Nextstrain Group.
 */
class Group {
  constructor(name) {
    const groupRecord = GROUP_RECORDS.get(name);

    if (!groupRecord) throw new NotFound(`unknown group: ${name}`);

    /**
     * Name of this Group.
     * @type {String}
     */
    this.name = groupRecord.name;

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
     * @type {String}
     */
    this.bucket = groupRecord.bucket;
  }
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


module.exports = {
  Group,
  ALL_GROUPS,
};
