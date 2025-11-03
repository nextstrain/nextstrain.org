/**
 * Index Nextclade dataset reference trees, including past versions.
 *
 * Transforms Nextclade's own index for use with our resourceIndexer/… and
 * src/resourceIndex.js framework.
 */
import { strict as assert } from "assert";
import { DateTime } from "luxon";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { fetch } from "../src/fetch.js";
import { NextcladeSource } from "../src/sources/nextclade.js";
import { rootDirFullPath } from "../src/utils/index.js";


const LOCAL_DATA = path.relative(".", path.join(rootDirFullPath, "devData", "nextclade"));
const LOCAL_INDEX = path.join(LOCAL_DATA, "index.json");


/* All class members are part of the "collection" interface expected by
 * resourceIndexer/main.js and use its terminology for arguments and return
 * values.  This interface is kind of a weird fit for things that aren't S3
 * inventories, so the chain of methods and way they pass values are a bit
 * contrived.
 */
export class NextcladeData {
  #source;

  name = "nextclade";

  async collect({local, save}) {
    if (local) {
      console.log(`Reading ${LOCAL_INDEX}`);
      this.#source = new NextcladeSource(JSON.parse(await readFile(LOCAL_INDEX)));
    }
    else {
      this.#source = new NextcladeSource();

      if (save) {
        console.log(`Saving ${LOCAL_INDEX}`);
        await mkdir(path.dirname(LOCAL_INDEX), {recursive: true});
        await writeFile(LOCAL_INDEX, JSON.stringify(await this.#source._index(), null, 2));
      }
    }

    const datasetPaths = await this.#source.availableDatasets();

    return (await Promise.all(
      datasetPaths.map(async (datasetPath) => {
        const dataset = this.#source.dataset(datasetPath.split("/"));
        const indexDataset = await dataset._indexDataset();

        /* Sort and collapse versions per our documented behaviour:
         *
         * > All times are UTC.  A datestamp refers to datasets uploaded
         * > between 00h00 and 23h59 UTC on that day.
         *
         * > If multiple datasets are uploaded on the same day we take the most
         * > recent.
         *
         * See <https://docs.nextstrain.org/page/guides/snapshots.html#details-for-dataset-maintainers>.
         */
        const datesSeen = new Set();
        const indexVersions =
          indexDataset.versions
            .map(v => ({...v, _timestamp: DateTime.fromISO(v.updatedAt, {zone:"UTC"})}))
            .toSorted((a, b) => b._timestamp - a._timestamp)
            .map(v => ({...v, _date: v._timestamp.toISODate()}))
            .filter(v => !datesSeen.has(v._date) && datesSeen.add(v._date))

        // Produce one resourceIndexer/main.js "item" per dataset version
        return (await Promise.all(
          indexVersions.map(async (indexVersion) => {
            const versionMetaPath = `${indexDataset.path}/${indexVersion.tag}/pathogen.json`;

            const localFile = path.join(LOCAL_DATA, versionMetaPath);

            let versionMeta;

            if (local) {
              console.log(`Reading ${localFile}`);
              versionMeta = JSON.parse(await readFile(localFile));
            }
            else {
              const remoteUrl = await this.#source.urlFor(versionMetaPath);

              console.log(`Fetching ${remoteUrl}`);
              const response = await fetch(remoteUrl, {cache: "no-cache"});
              assert(response.status === 200);

              versionMeta = await response.json();

              if (save) {
                console.log(`Saving ${localFile}`);
                await mkdir(path.dirname(localFile), {recursive: true});
                await writeFile(localFile, JSON.stringify(versionMeta, null, 2));
              }
            }

            /* This filter must be *after* we fetch the version's own
             * pathogen.json.  Because versions are filtered to one-per-day
             * *before* we fetch, it's possible there's an older version from
             * the same day that *does* include a treeJson, and we'd miss it.
             * The fix would be fetching *all* versions and only then filtering
             * to one-per-day (i.e. in createResource() below).
             *
             * Doing so, however, seems unnecessary.  The scenario seems
             * unlikely and it's not entirely clear how we'd want to interpret
             * such a dataset update anyway (e.g. was the earlier version on
             * the same day in error?).
             *
             * Also note that this filters out some datasets entirely: those
             * that don't have a reference tree at all.
             *   -trs, 27 Oct 2025
             */
            if (!versionMeta.files.treeJson)
              return;

            // One "item" produced by collect()
            return {
              // Used by resourceIndexer/main.js
              source: this.#source.name,
              resourceType: "dataset",
              resourcePath: datasetPath,

              // Used in createResource() below
              version: {
                date: indexVersion._date,
                fileUrls: {
                  main: await this.#source.urlFor(`${indexDataset.path}/${indexVersion.tag}/${versionMeta.files.treeJson}`)
                }
              },
            };
          })
        )).flat();
      })
    )).flat();
  }

  categorise(item) {
    return item;
  }

  createResource(resourceType, resourcePath, items) {
    return {
      versions: items.map(i => i.version),
    };
  }
}
