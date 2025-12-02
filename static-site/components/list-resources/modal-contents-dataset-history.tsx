"use client";

import React, { useCallback, useEffect, useState} from "react";
import modal_draw from "./modal_draw";
import { VersionedResource } from "./types";
import styles from "./modal.module.css";
import { lightGrey } from "./modal";
import { InternalError } from "../error-boundary";

export function DatasetHistory({
  resource,
}: {
  /** the VersionedResource object to display */
  resource: VersionedResource;
}): React.ReactElement {

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  // FIXME figure out what type can be assigned to `node`
  // * `unknown` doesn't work
  // * `React.SetStateAction<null>` doesn't work
  // * `React.LegacyRef<HTMLDivElement>` doesn't work
  const handleRef = useCallback((node: HTMLDivElement | null): void => {
    setRef(node);
  }, []);

  useEffect((): void => {
    if (ref && resource) {
      modal_draw(ref, resource, lightGrey);
    }
  }, [ref, resource]);

  

  const summary = _snapshotSummary(resource.dates);
  return (
    <>
      <div className={styles.title}>{resource.name.replace(/\//g, "│")}</div>
      <div className={styles.snapshotWrapper}>
        <strong>
        {`${resource.dates.length} snapshots spanning ${summary.duration}: ${summary.first} - ${summary.last}`}
        </strong>
        <a
        className={styles.snapshotLink}
        href={`/${resource.name}`}
        rel="noreferrer noopener"
        target="_blank"
        >
        (click to view the latest available snapshot)
        </a>
      </div>
      <div>{resource.updateCadence.description}</div>
      {/* d3 controlled div */}
      <div ref={handleRef} />
      <div className={styles.italic}>
        {`Each circle represents a previous snapshot of the dataset. `}
        <strong>Mouse-over the light-grey axis box</strong> to identify the
        latest available snapshot for any given date, and click to load the
        snapshot.
        <br />
        Alternatively, <strong>hover over dots</strong> to show the date the
        analysis was shared and <strong>click on a dot</strong> to load that
        particular snapshot.
        <br />
        <br />
        {`Note: circles represent update date which may differ from when the
        analysis was run.
        An updated dataset doesn't necessarily mean there was new data.
        Finally, there may be a very recent upload which is newer than
        ${summary.last} which is not shown on this page
        (loading the "latest available snapshot" will always fetch the latest version).`}
      </div>
    </>
  )
}


/**
 * Internal helper function that converts a provided list of dates
 * into an object with `duration`, `first`, and `last` properties,
 * representing the duration of the dates in the list, the
 * chronologically first date in the list, and the chronologically
 * last date in the list.
 */
function _snapshotSummary(
  /** list of dates to snapshot */
  dates: string[],
): {
  duration: string;
  first: string;
  last: string;
} {
  const d = [...dates].sort();
  const d1 = d[0];
  const d2 = d.at(-1);

  if (d1 === undefined || d2 === undefined) {
    throw new InternalError("Missing dates.");
  }

  const days = (new Date(d2).getTime() - new Date(d1).getTime()) / 1000 / 60 / 60 / 24;

  let duration = "";

  if (days < 100) {
    duration = `${days} days`;
  } else if (days < 365 * 2) {
    duration = `${Math.round(days / (365 / 12))} months`;
  } else {
    duration = `${Math.round(days / 365)} years`;
  }

  return { duration, first: d1, last: d2 };
}
