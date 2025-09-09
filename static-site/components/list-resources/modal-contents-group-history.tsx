"use client";

import React, { useEffect, useState} from "react";
import { FilterOption, Group, PathVersionsForGroup, GroupFilesChangelog } from "./types";
import styles from "./modal.module.css";
import Spinner from "../spinner";

/**
 * Show the entire history of a Group in a changelog-style UI.
 * History data is fetched by the `group.fetchHistory()` callback.
 *
 * Note: Each time this component is rendered we fetch the history
 * afresh - we could/should instead store this on the `Group` object.
 * (I think opening the same modal multiple times in a session will be
 * an uncommon thing to do.)
 */
export function GroupHistory({
  group,
  selectedFilterOptions,
}: {
  group: Group,
  selectedFilterOptions: readonly FilterOption[]
}): React.ReactElement | null {
  const [history, setHistory] = useState<GroupFilesChangelog>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect((): void => {
    async function effect(): Promise<void> {
      try {
        if (!group.fetchHistory) {
          throw new Error("Group object missing property fetchHistory")
        }
        const pathVersions = (await group.fetchHistory());
        // uncomment below for easy testing of a slow fetch
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        const history = _changelog(pathVersions)
        if (history.length===0) {
          return setErrorMessage('Invalid API response (zero past versions!)')
        }
        setHistory(history);
        return setLoading(false);
      } catch (err) {
        setErrorMessage(`Failed to fetch data about ${group.groupName}. ${err}`)
      }
    }
    effect();
  }, [group]);

  if (errorMessage) {
    return (<ShowError msg={errorMessage}/>);
  }
  if (loading) {
    return (<div><Spinner/></div>);
  }

  /* filter on the fly (cheap enough to run per render) */
  const filterWords = selectedFilterOptions
    .map((opts) => opts.value)
    .filter((value) => value!==group.groupName);
  const filteredHistory = _filterHistory(history, filterWords);

  const nDays = filteredHistory.length;
  const allFiles = filteredHistory.flatMap((h) => Object.keys(h[1]));
  const nFilesUnique = (new Set(allFiles)).size;

  return (
    <>
      <div className={styles.title}>
        {`All past versions of ${group.groupName} workflow files`}
      </div>
      {`${nFilesUnique} different filenames uploaded over ${nDays} separate days going back to ${filteredHistory.at(-1)?.[0]}.`}
      {` In total there are ${allFiles.length} files listed here.`}
      <div className={styles.newLine}>
        {`Each link points to a versioned file associated with the specified day. The data shown here may be out of date by a day or two`}
        {` and thus there could be more recent versions of a particular file uploaded since ${filteredHistory.at(0)?.[0]};`}
        {` please use the link on the background page to guarantee you're getting the latest version of a particular file.`}
        {` Finally there may have been files or versions beyond those shown here which are no longer available.`}
      </div>
      {filterWords.length!==0 && (
        <div className={styles.newLine}>
          {` Filtered on ${filterWords.length} keywords: ${filterWords.map((x) => `"${x}"`).join(', ')}.`}
        </div>
      )}

      {filteredHistory.map(([date, info]) => {
        return (
          <>
            <div className={styles.changelogSectionTitle}>
              {date}
            </div>
            <ul>
              {Object.entries(info).map(([filename, url]) => {
                const displayFilename = filename.split('/').join(' / ');
                return (
                  <li className={styles.list} key={filename}>
                    <a href={url}>{displayFilename}</a>
                  </li>
                )
              })}
            </ul>
          </>
        )
      })}
    </>
  )
}


function _filterHistory(history: GroupFilesChangelog, filters: string[]): GroupFilesChangelog {
  if (!filters.length) return history;
  // Use a cache to speed things up as the same filenames are repeated many times
  const cache: Map<string, boolean> = new Map(); // true: passes filter, false: exclude
  return history.flatMap(([date, files]) => { // flatMap allows empty array returns to disappear
    const filePairs = Object.entries(files)
      .filter(([filename, ]) => {
        if (!cache.has(filename)) {
          const filewords = filename.split('/');
          const passes = filters.map((w) => filewords.includes(w)).every((el) => el===true);
          cache.set(filename, passes);
        }
        return cache.get(filename);
      })
    if (filePairs.length===0) return []; // no matches from this day
    return [[date, Object.fromEntries(filePairs)]]
  })
}

function _changelog(pathVersions: PathVersionsForGroup): GroupFilesChangelog {
  const dates = _orderedDates(pathVersions);
  const indexes = Object.fromEntries(dates.map((d, i) => [d, i]));
  const history: GroupFilesChangelog = dates.map((d) => [d, {}]);
  for (const [id, infoByDay] of Object.entries(pathVersions)) {
    for (const info of infoByDay) {
      const date = info.date;
      for (const [filename, url] of Object.entries(info)) {
        if (filename==='date') continue;
        const dateIdx = indexes[date];
        if (dateIdx===undefined) continue;
        const historyEl = history[dateIdx];
        if (historyEl===undefined) continue;
        historyEl[1][`${id}/${filename}`] = url;
      }
    }
  }
  return history;
}

/**
 * Return a chronologically ordered (latest first) array of dates present
 * in the API response's `PathVersionsForGroup` data
 */
function _orderedDates(pathVersions: PathVersionsForGroup): string[] {
  return Array.from(
    new Set(
      Object.entries(pathVersions)
        .flatMap((el) => el[1].map((info) => info.date))
    )
  ).sort().reverse();
}


function ShowError({msg}: {msg: string}): React.ReactElement {
  return (
    <div>
      <div className={styles.error}>
        {`Something's gone wrong!`}
      </div>
      <div className={styles.error}>
        {msg}
      </div>
    </div>
  )
}
