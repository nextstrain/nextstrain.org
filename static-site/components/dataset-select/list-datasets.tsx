import React from "react";

import CenteredContainer from "../../components/centered-container";
import { DatasetSelectColumnsType, DatasetType } from "./types";

import styles from "./list-datasets.module.css";

/**
 * React Server Component to render a table showing the `datasets` as rows
 * with the specified `columns`. Open to future expansion.
 *
 * Currently only 2 or 3 columns are supported.
 *
 * If 3 columns are supplied, the 3rd will not be shown on small screens.
 */
export default function ListDatasets({
  datasets,
  columns,
}: {
  /** List of datasets to display */
  datasets: DatasetType[];

  /** List of columns to display */
  columns: DatasetSelectColumnsType[];
}): React.ReactElement {
  return (
    <CenteredContainer>
      <div className={styles.rowContainer}>
        <HeaderRow columns={columns} />
        <div className={styles.datasetSelectionResultsContainer}>
          {datasets.map((dataset) => (
            <NormalRow
              dataset={dataset}
              columns={columns}
              key={columns[0]?.value(dataset)}
            />
          ))}
        </div>
      </div>
    </CenteredContainer>
  );
}

/** The header of the dataset listing; shows column names */
function HeaderRow({
  columns,
}: {
  /** The column definition to drive the display */
  columns: DatasetSelectColumnsType[];
}): React.ReactElement {
  const names = columns.map((c) => c.name);

  if (columns.length === 1) {
    return (
      <div className={styles.row}>
        <div>{names[0]}</div>
      </div>
    );
  } else {
    return (
      <div className={styles.row}>
        <div className={styles.col1}>{names[0]}</div>
        <div className={styles.col2}>{names[1]}</div>
      </div>
    );
  }
}

/** A row displaying a dataset */
function NormalRow({
  columns,
  dataset,
}: {
  /** The column definition to drive the display */
  columns: DatasetSelectColumnsType[];

  /** The dataset displayed in the row */
  dataset: DatasetType;
}): React.ReactElement {
  if (columns.length === 1) {
    return (
      <div className={styles.row}>
        <div>
          <Value dataset={dataset} columnInfo={columns[0]} firstColumn />
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.row}>
        <div className={styles.col1}>
          <Value dataset={dataset} columnInfo={columns[0]} firstColumn />
        </div>
        <div className={styles.col2}>
          <Value dataset={dataset} columnInfo={columns[1]} />
        </div>
      </div>
    );
  }
}

/**
 * Render the value for a particular cell in the table.
 * May be a link and/or have a logo, depending on the data in `columnInfo`
 */
function Value({
  dataset,
  columnInfo,
  firstColumn,
}: {
  /** The type of dataset being displayed */
  dataset: DatasetType;

  /** The column definition to drive the display */
  columnInfo: DatasetSelectColumnsType | undefined;

  /** Is this the first column in the table? */
  firstColumn?: boolean;
}): React.ReactElement {
  if (!columnInfo) {
    // this shouldn't ever happen
    throw new Error("oh the typechecker was right!");
  }

  const url = typeof columnInfo.url === "function" && columnInfo.url(dataset);

  const value = columnInfo.value(dataset);

  const logo =
    typeof columnInfo.logo === "function"
      ? columnInfo.logo(dataset)
      : undefined;

  return (
    <>
      {logo && url ? (
        <a className={styles.logoContainerLink} href={url}>
          {logo}
        </a>
      ) : logo ? (
        <span className={styles.logoContainer}>{logo}</span>
      ) : null}
      {url ? (
        <a
          className={styles.styledLink}
          href={url}
          style={{ fontWeight: firstColumn ? 500 : 300 }}
        >
          {value}
        </a>
      ) : (
        value
      )}
    </>
  );
}
