/**
 * XXX FIXME
 */
import { strict as assert } from "assert";
import { DateTime } from "luxon";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fetch } from "../src/fetch.js";
import { NextcladeSource } from "../src/sources/nextclade.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __basedir = path.join(__dirname, "..");

const LOCAL_DATA = path.join(__basedir, "devData", "nextclade");
const LOCAL_INDEX = path.join(LOCAL_DATA, "index.json");


/* All class members are part of the "collection" interface
 * expected by resourceIndexer/main.js and use its terminology
 * for arguments and return values.  This interface is kind of
 * a weird fit for things that aren't S3 inventories, so some
 * return values are a bit contrived.
 */
export class NextcladeData {
  #source;

  name = "nextclade";

  async collect({local, save}) {
    if (local) {
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

    const items = [];
    const datasetPaths = await this.#source.availableDatasets();

    for (const datasetPath of datasetPaths) {
      const dataset = this.#source.dataset(datasetPath.split("/"));
      const indexDataset = await dataset._indexDataset();

      const datesSeen = new Set();
      const indexVersions =
        indexDataset.versions
          .map(v => ({...v, _timestamp: DateTime.fromISO(v.updatedAt, {zone:"UTC"})}))
          .toSorted((a, b) => b._timestamp - a._timestamp)
          .map(v => ({...v, _date: v._timestamp.toISODate()}))
          .filter(v => !datesSeen.has(v._date) && datesSeen.add(v._date))

      for (const indexVersion of indexVersions) {
        const versionMetaPath = `${indexDataset.path}/${indexVersion.tag}/pathogen.json`;

        const localFile = path.join(LOCAL_DATA, versionMetaPath);

        let versionMeta;

        if (local) {
          versionMeta = JSON.parse(await readFile(localFile));
        }
        else {
          const response = await fetch(await this.#source.urlFor(versionMetaPath), {cache: "no-cache"});
          assert(response.status === 200);

          versionMeta = await response.json();

          if (save) {
            console.log(`Saving ${localFile}`);
            await mkdir(path.dirname(localFile), {recursive: true});
            await writeFile(localFile, JSON.stringify(versionMeta, null, 2));
          }
        }

        if (!versionMeta.files.treeJson)
          continue;

        items.push({
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
        });
      }
    }

    return items;
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
