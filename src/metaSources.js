const sources = require("./sources");
const utils = require("./utils");

const PRODUCTION = process.env.NODE_ENV === "production";

/**
 * A meta-source representing all known groups.
 * Created using a IIFE to close around state representing the
 * available datasets & narratives for all groups. This allows
 * us to update this state on our own timeframe, independent
 * of API requests.
 */
const Groups = (() => {

  const groupSources = new Map( // instances of each group Source
    Array.from((sources))
      .filter(([name, Source]) => Source.isGroup())  // eslint-disable-line no-unused-vars
      // restrict development server's private groups to "blab-private"
      .filter(([name, Source]) => PRODUCTION ? true : (Source.visibleToUser() || name==="blab-private"))
      .map(([name, Source]) => [name, new Source()])
  );

  const datasetsPerGroup = new Map();
  const narrativesPerGroup = new Map();

  const updateKnownDatasetsAndNarratives = async () => {
    // following loop is intentionally sequential to reduce load on server
    for await (const [groupName, source] of groupSources) {
      try {
        datasetsPerGroup.set(
          groupName,
          (await source.availableDatasets()).map((p) => `/groups/${groupName}/${p}`)
        );
      } catch (err) {
        utils.warn(`Error fetching available datasets for group ${groupName}: ${err}`);
      }
      try {
        narrativesPerGroup.set(
          groupName,
          (await source.availableNarratives()).map((p) => `/groups/${groupName}/narratives/${p}`)
        );
      } catch (err) {
        utils.warn(`Error fetching available narratives for group ${groupName}: ${err}`);
      }
    }
    utils.log("Updated known group datasets / narratives");
    for (const [name] of groupSources) {
      utils.log(`\t${name}: ${(datasetsPerGroup.get(name) || []).length} datasets, ${(narrativesPerGroup.get(name) || []).length} narratives`);
    }
  };

  /**
   * Periodically update the datasets / narratives we are aware of.
   * As this involves API calls to AWS S3, we accept a certain amount
   * of staleness in order to reduce server load.
   */
  setTimeout(
    updateKnownDatasetsAndNarratives,
    1000 * 60 * 60 * 6 // 6 hours
  );
  updateKnownDatasetsAndNarratives(); // initial collection on server start

  class MetaGroupSource {
    static get _name() { return "groups"; }
    get name() { return "groups"; }

    constructor(user) {
      this.visibleGroups = new Set(
        Array.from(groupSources)
          .filter(([groupName, source]) => source.visibleToUser(user)) // eslint-disable-line no-unused-vars
          .map(([groupName]) => groupName)
      );
    }
    availableDatasets() {
      return Array.from(datasetsPerGroup)
        .filter(([groupName]) => this.visibleGroups && this.visibleGroups.has(groupName))
        .map((e) => e[1])
        .flat();
    }
    availableNarratives() {
      return Array.from(narrativesPerGroup)
        .filter(([groupName]) => this.visibleGroups && this.visibleGroups.has(groupName))
        .map((e) => e[1])
        .flat();
    }
  }
  return MetaGroupSource;
})();

const metaSourceMap = new Map([
  ["groups", Groups]
]);

module.exports = metaSourceMap;
