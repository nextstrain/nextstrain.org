import * as authz from './authz/index.js';
import { PRODUCTION } from './config.js';
import { ALL_GROUPS } from './groups.js';
import * as utils from './utils/index.js';

/**
 * A meta-source representing all known groups.
 * Created using a IIFE to close around state representing the
 * available datasets & narratives for all groups. This allows
 * us to update this state on our own timeframe, independent
 * of API requests.
 */
const Groups = (() => {

  const publiclyVisible = source =>
    authz.authorized(null, authz.actions.Read, source);

  const groupSources = new Map( // instances of each group Source
    ALL_GROUPS
      .map(g => [g.name, g.source])
      // restrict development server's private groups to "blab-private"
      .filter(([name, source]) => PRODUCTION ? true : (publiclyVisible(source) || name==="blab-private"))
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
    constructor(user) {
      this.visibleGroups = new Set(
        Array.from(groupSources)
          .filter(([, source]) => authz.authorized(user, authz.actions.Read, source))
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

export {
  Groups,
};
