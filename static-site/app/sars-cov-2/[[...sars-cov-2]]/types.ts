import React from "react";

/** An individual language in the situation reports */
export type LanguageObject = {
  /** ISO code for language */
  languageCode: string;

  /** Name of the language, in the language */
  languageNative: string;

  /** Situation reports in this language */
  narratives: NcovSitRepInfo[];
};

/** An individual situation report */
export type NcovSitRepInfo = {
  /** The URL for the report */
  url: string;

  /** Date of the report */
  date: string;

  /** ISO code for the language the report is written in */
  languageCode: string;

  /** The name of the report language, in the language */
  languageNative: string;
};

/**
 * A utility type for elements in the data structure used by the
 * <ResourceListing> component
 */
export type ResourceListEntry = {
  /** is the entry an external link or an anchor within this page? */
  type: "external" | "anchor";

  /** the destination of the link */
  to: string;

  /** the title of the link */
  title: string;

  /** chunk of JSX be displayed beneath the link; not used with type="anchor" */
  subtext?: React.ReactElement | string;
};

/** The format of the JSON file with the situation reports */
export type SitRepJson = {
  /** All the situation report narratives  */
  narratives: { request: string }[];
};
