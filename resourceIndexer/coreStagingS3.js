import { SOURCE, VALID_AUSPICE_PATTERNS, INVALID_AUSPICE_PATTERNS,
  DATESTAMP_REGEXES, SIDECAR_TYPES } from './constants.js';
import { collectInventory } from './inventory.js';
import { remapCoreUrl } from "./coreUrlRemapping.js";

/**
 * The inventory of buckets (especially the core bucket) is in some ways a
 * historical record of work over the years, but this isn't really what we want
 * to display to users. As some examples:
 *    - Files which don't match a resource to list should be excluded
 *    - Datestamped files (e.g. _YYYY-MM-DD in the filename) are excluded
 *      (we use S3 versioning instead)
 *
 * If the s3 object is to be excluded we return false here.
 *
 * In the case where the object represents a (part of) a resource we want to
 * expose, then we categorise it here by adding the following properties:
 *   - source (STAGING or CORE)
 *   - resourceType (dataset, narrative or intermediate)
 *   - id (the ID by which objects will be grouped together.
 *        For datasets this is the nextstrain.org URL path, without any temporal signifier)
 *   - subresourceType (currently only for resourceType=dataset)
 */
function categoriseCoreObjects(item, staging) {
  const key = item.key;
  item.source = staging ? SOURCE.STAGING : SOURCE.CORE;
  item.baseUrl = `https://${item.bucket}.s3.amazonaws.com/${encodeURI(key)}`
  if (key.startsWith('search_')
    || key.startsWith('manifest_')
    || key.startsWith('datasets_')
  ) return false;

  /* slash-containing filenames are not (auspice) datasets, but they may be intermediate files */
  if (key.includes("/")) {
    if (!staging && _isIntermediateFile(key)) {
      item.resourceType = 'intermediate';
      item.resourcePath = _intermediateResourcePath(key);
      return item;
    }
    return false;
  }

  // Some filenames have a double underscore (presumably by mistake)
  if (key.includes('__')) return false;

  // We don't have narratives on the core/staging buckets, so all that's left is
  // to check if the key looks like a valid auspice file
  const auspiceFileInfo = auspiceFile(key, staging);
  if (!auspiceFileInfo) return false
  item.resourceType = 'dataset';
  item.subresourceType = auspiceFileInfo.subresourceType;

  /**
   * The S3 key name gives us the expected nextstrain URL path, however this may
   * not be the correct (current) URL path for two reasons:
   *
   * 1. We've implemented a number of redirects, such as /flu → /seasonal-flu.
   *    When viewing the history of a /seasonal-flu dataset we can include the
   *    versions stored under 'flu*' S3 keys.
   *
   * 2. There are also situations where we chose to redirect the URL for dataset
   *    A to dataset B for various reasons. We don't want the history of B to
   *    include dataset A, so `remapCoreVersion` takes these situations into
   *    account.
   *
   */
  item.resourcePath = remapCoreUrl(auspiceFileInfo.urlPath, item);

  return item;
}

/**
 * Returns false if the filename doesn't appear to be an auspice dataset/sidecar file
 * Otherwise returns an object with properties subresourceType and urlPath
 */
function auspiceFile(filename, staging) {
  if (!staging) { /* only filter out datasets with a datestamp for the core (versioned) bucket */
    for (const r of DATESTAMP_REGEXES) {
      if (filename.match(r)) return false;
    }
  }
  for (const pattern of INVALID_AUSPICE_PATTERNS) {
    if (filename.match(pattern)) return false;
  }
  for (const [type, pattern] of VALID_AUSPICE_PATTERNS) {
    if (filename.match(pattern)) {
      return {
        subresourceType: type,
        urlPath: filename.replace(pattern, '').replace(/_/g, '/'),
      }
    }
  }
  return false;
}


/**
 * Given a list of items (i.e. files) which appear to be valid components of a resource
 * we want to group them into versioned resources. As an example, we may have
 *  - date: A, files: X_tree.json, X_meta.json
 *  - date: B, files: X_meta.json (invalid)
 *  - date: C, files: X.json
 *  - date: D, files: X.json, X_root-sequence.json
 *  - date: E, files: X_root-sequence.json (invalid)
 *  - date: F, files: X.json, X.json, X_root-sequence.json (valid, pick the newest X.json)
 * and we want to produce a structure like:
 * [
 *  {date: F, versions: [{main: versionId, root-sequence: versionId}]},
 *  {date: D, versions: [{main: versionId, root-sequence: versionId}]},
 *  {date: C, versions: [{main: versionId}]},
 *  {date: A, versions: [{v1-meta: versionId, v1-tree: versionId}]}
 * ]
 *
 * The maximum temporal resolution is per-day, in other words if a resource was uploaded
 * multiple times in a single day then only the last one is used. This matches our
 * (implicit) expectation when we started used datestamped datasets during the ncov pandemic.
 * It also covers the (somewhat common, I think) case where datasets were re-uploaded after
 * an error / omission was noticed.
 *
 * The returned object may contain `versions:[]` (empty array) if no valid versions are found.
 */
function createVersionedResources(resourceType, id, items) {
  const groupedByDate = items.reduce((acc, o) => {
    const date = o.date;
    if (acc.hasOwnProperty(date)) { // eslint-disable-line no-prototype-builtins
      acc[date].push(o)
    } else {
      acc[date] = [o]
    }
    return acc;
  }, {});

  // Associate each of the files behind this dataset to its version ID
  const versions = Object.entries(groupedByDate)
    // sort the groups by the day (first entry: most recent)
    .sort(([dateA, ], [dateB, ]) => dateA < dateB ? 1 : dateA > dateB ? -1 : 0)
    // (re-)sort the objects within each day (first entry: most recent).
    .map(([date, objects]) => [date, objects.sort((a, b) => b.timestamp - a.timestamp)])
    // convert the objects for each day into resource objects (or false)
    .map(([date, objects]) => {
      if (resourceType==='dataset') {
        return validDataset(id, date, objects);
      } else if (resourceType==='intermediate') {
        return validIntermediate(id, date, objects);
      } else {
        throw new Error(`Unknown resourceType '${resourceType}' to create versioned resource from`)
      }
    })
    // remove days without a resource object (some days might have files but no valid dataset)
    .filter((version) => !!version);

  const resource = {versions};
  return resource;
}


/**
 * Given a set of files from the same _day_ (S3 keys) return the subset such
 * that, taken together, they represent a dataset. Often a dataset will be
 * uploaded multiple times in a single day (often to fix minor mistakes) and we
 * only want to surface the last-updated dataset on the day. Note that each
 * individual object provided here is a valid dataset-related file in its own right,
 * but taken together the objects may not represent a valid dataset, or only a
 * subset may represent a valid dataset.
 *
 * We take the first (i.e. most recent) occurrence of valid files. In theory we
 * could have a situation where we take a sidecar file that wasn't intended to
 * be grouped with the auspice json, but I think that's worth the
 * simplifications it allows here.
 */
function validDataset(id, date, objects) {
  /**
   * The `subresources` object represents the maximal possible collection of
   * subresources for this dataset. The keys are the subresource types, and the
   * values are false (subresource doesn't exist) or the relevant s3 object.
   */
  const subresources = Object.fromEntries(
    VALID_AUSPICE_PATTERNS.map(([subresourceType, ]) => [subresourceType, false])
  );

  const _firstItem = (type) => objects.find((o) => o.subresourceType===type);

  /**
   * Take a v2 dataset over a v2 dataset _even if_ the v1 dataset was uploaded
   * more recently. (This is not hypothetical - it is the case for /zika as of
   * 2023-11-01.) This is almost certainly an unintentional situation, and the
   * behaviour of the nextstrain.org server is to look for a v2 dataset and use
   * that, irregardless of whether a v1 dataset exists.
   */
  const types = new Set(objects.map((o) => o.subresourceType));
  if (types.has('main')) {
    subresources.main = _firstItem('main');
  } else if (types.has('meta') && types.has('tree')) {
    subresources.meta = _firstItem('meta');
    subresources.tree = _firstItem('tree');
  } else {
    /* It isn't unexpected to encounter days with auspice-like files but no
    valid dataset. Looking at the core bucket in early 2024 identified ~70 such
    occurrences. It seems like this is (mostly?) due to delete markers being
    added for the main dataset (which causes the indexer to remove the
    then-latest object) but not sidecars, and thus we observe a day where only
    sidecars seem to exist. */
    return false;
  }

  ([...types]).filter((subresourceType) => SIDECAR_TYPES.has(subresourceType))
    .forEach((subresourceType) => {
      subresources[subresourceType] = _firstItem(subresourceType);
    })

  return {
    date,
    fileUrls: Object.fromEntries(
      Object.entries(subresources).map(([subresourceType, s3object]) => {
        if (!s3object.versionId) { // (bucket unversioned)
          return [subresourceType, s3object.baseUrl]
        }
        return [subresourceType, `${s3object.baseUrl}?versionId=${encodeURIComponent(s3object.versionId)}`]
      })
    )
  };
}

/* Intermediate files in the core bucket are many and varied, however we expect them
 * to follow the format specified in <https://docs.nextstrain.org/en/latest/reference/data-files.html>
 * and thus we can determine if a file is an intermediate file by the key (filename) alone.
 *
 * At the moment we only consider "workflows", i.e. files in `/files/workflows/*`
 * as there are currently no "build intermediate files" (i.e. the intermediate files
 * of a phylogenetic workflow) and it's unclear if we'll ever store these.
 *
 * The file name schema is:
 *   /files
 *     /workflows
 *       {/workflow-repo}                (matching github.com/nextstrain{/workflow-repo})
 *         {/arbitrary-structure*}
 *           /metadata.tsv.zst (etc)
 *           /sequences.fasta.zst (etc)
 *
 * For the current listing we filter out any files where "/arbitrary-structure*" matches
 * some hardcoded list in an attempt to filter out test runs which we don't want to surface.
 *
 * We also include /files/ncov which predates the above structure design.
 */
function _isIntermediateFile(key) {
  const excludePatterns = [
    /* testing/tmp directories */
    /\/(?:branch|test|test-data|trial|trials)\//,
    /\/forecasts-(flu|ncov)\//,
    /\/cartography\//,
    /** monkeypox filenames contain data from 2022-06-01 - 2023-10-31 before we changed
     * to using 'mpox'. We could combine this with the mpox files if desired. */
    /\/monkeypox\//,
     /* lowercase 'wnv' used once (2024-10-04) */
    /\/wnv\//,
    /* the TB workflow is in flux - revisit once the datasets are "released" */
    /\/tb\//,
    /* We could detail versions via the datestamped filename if desired */
    /\/nextclade-full-run[\d-]+--UTC\//,
  ];

  if (key.endsWith('/')) {
    // oropouche has keys for directory-like objects, but they're not valid intermediate files
    return false
  }

  if ((key.startsWith("files/workflows/") || key.startsWith("files/ncov/"))) {
    for (const pattern of excludePatterns) {
      if (key.match(pattern)) return false;
    }
    return true;
  }
  return false;
}

/**
 * The *resourcePath* is essentially the (unversioned) ID of the resource.
 * (For Auspice datasets, this is combined with the source to form the URL of the
 * dataset, but that's not applicable for intermediate files.) This ID is used
 * to group together versions of an intermediate resource.
 *
 * Note: redirects are not yet considered for intermediate resource paths, and
 * thus 'monkeypox' and 'mpox' intermediate resources are separate intermediate
 * files.
 *
 * Examples ( S3 key → resourcePath)
 *    files/ncov/open/100k/metadata.tsv.xz → ncov/open/100k
 *    files/workflows/zika/sequences.fasta.zst → zika
 *
 */
function _intermediateResourcePath(key) {
  return key
    .replace(/^files\/ncov\//, "ncov/")
    .replace(/^files\/workflows\//, "")
    .replace(/\/[^/]+$/, '');
}

/**
 * For a set of intermediate files (on a given day), return the subset to be
 * represented by the resource. We don't perform any filename-based pruning at
 * the moment, so the files for the resource are everything on the bucket which
 * was assigned the same ID - this includes the same "file" under different
 * compression schemes (etc), as that results in a different filename (key).
 * If multiple files exist on the same day the first (most recent) is taken.
 */
function validIntermediate(id, date, objects) {
  const seenKeys = new Set();
  return {
    date,
    fileUrls: Object.fromEntries(
      objects
        .filter((o) => {
          if (seenKeys.has(o.key)) return false;
          seenKeys.add(o.key)
          return true;
        })
        .map((s3object) => {
          const filename = s3object.key.split('/').pop();
          const url = s3object.versionId ?
            `${s3object.baseUrl}?versionId=${encodeURIComponent(s3object.versionId)}` :
            s3object.baseUrl;
          return [filename, url]
        })
    )
  };
}


export const coreS3Data = {
  name: 'core',
  async collect({local, save}) {
    return await collectInventory({
      name: this.name,
      local,
      save,
      inventoryBucket: "nextstrain-inventories",
      inventoryPrefix: "nextstrain-data/config-v1/"
    })
  },
  categorise: (item) => categoriseCoreObjects(item, false),
  createResource: createVersionedResources
};

export const stagingS3Data = {
  name: 'staging',
  async collect({local, save}) {
    return await collectInventory({
      name: this.name,
      local,
      save,
      inventoryBucket: "nextstrain-inventories",
      inventoryPrefix: "nextstrain-staging/config-v1/"
    })
  },
  categorise: (item) => categoriseCoreObjects(item, true),
  createResource: createVersionedResources
};
