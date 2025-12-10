"use client";

import React from "react";

import { get } from "lodash";

import DatasetSelect from "../../components/dataset-select";
import DatasetMap from "../../components/dataset-select/dataset-map";
import {
  DatasetType,
  DatasetSelectColumnsType,
} from "../../components/dataset-select/types";
import FlexCenter from "../../components/flex-center";
import {
  FocusParagraph,
  FocusParagraphCentered,
} from "../../components/focus-paragraph";
import {
  SmallSpacer,
  MediumSpacer,
  HugeSpacer,
} from "../../components/spacers";
import sarscov2Catalogue from "../../content/SARS-CoV-2-Datasets.yaml";

import SituationReportsByLanguage from "./situation-reports-by-language";

import { ResourceListEntry } from "./types";
import { title } from "./constants";

import styles from "./content.module.css";

/** Column definitions for <DatasetSelect> */
const tableColumns: DatasetSelectColumnsType[] = [
  {
    name: "Dataset",
    value: (dataset) =>
      dataset.filename?.replace(/_/g, " / ").replace(".json", "") || "",
    url: (dataset) => dataset.url,
  },
  {
    name: "Contributor",
    value: (dataset) => dataset.contributor || "",
    url: (dataset) => dataset.contributorUrl || "",
    logo: (dataset) =>
      dataset.contributor === "Nextstrain Team" ? (
        <img
          alt="nextstrain.org"
          className="logo"
          width="24px"
          src={"/nextstrain-logo-small.png"}
        />
      ) : undefined,
  },
];

// We use <a> elements not <Link> because the links here need to go to the server which will then send the Auspice entrypoint
/* eslint-disable @next/next/no-html-link-for-pages */

/**
 * React Client Component that generates the content of the /sars-cov-2 page
 */
export default function SarsCov2PageContent(): React.ReactElement {

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const datasets = (sarscov2Catalogue as { datasets: DatasetType[] })[
    "datasets"
  ];

  const parsedDatasets = _parseDatasetsFilterList(datasets);

  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      <h1>{title}</h1>

      <SmallSpacer />

      <FlexCenter>
        <FocusParagraphCentered>
          Labs from all over the world are sequencing SARS-CoV-2 and sharing
          genomic data. The Nextstrain team analyzes these data on a global and
          continental level. More specific analyses are often performed by
          public health and academic groups from around the world. This page
          lists a sample of such analyses. In addition to exploring SARS-CoV-2
          evolution in finished analyses, you can use Nextclade to compare your
          sequences to the SARS-CoV-2 reference genome, assign them to clades,
          and see where they fall on a SARS-CoV-2 phylogeny.
        </FocusParagraphCentered>
      </FlexCenter>

      <MediumSpacer />

      <ResourceListing />

      <div id="datasets">
        <HugeSpacer count={2} />
        <h2 className="left">All SARS-CoV-2 datasets</h2>
        <SmallSpacer />
        <FocusParagraph>
          This section is an index of public Nextstrain datasets for SARS-CoV-2,
          organized by geography. Some of these datasets are maintained by the
          Nextstrain team and others are maintained by independent research
          groups. If you know of a dataset not listed here, please let us know!
          Please note that inclusion on this list does not indicate an
          endorsement by the Nextstrain team.
        </FocusParagraph>
        <HugeSpacer />
        <DatasetSelect
          datasets={parsedDatasets}
          columns={tableColumns}
          interfaces={[
            DatasetMap,
            "FilterSelect",
            "FilterDisplay",
            "ListDatasets",
          ]}
        />
      </div>

      <div id="sit-reps">
        <HugeSpacer count={2} />

        <h2 className="left">All SARS-CoV-2 situation reports</h2>

        <SmallSpacer />

        <FocusParagraph>
          We have been writing interactive situation reports using{" "}
          <a href="https://nextstrain.github.io/auspice/narratives/introduction">
            Nextstrain Narratives{" "}
          </a>
          to communicate how COVID-19 is moving around the world and spreading
          locally. These are kindly translated into a number of different
          languages by volunteers and Google-provided translators — click on any
          language below to see the list of situation reports available.
        </FocusParagraph>

        <MediumSpacer />

        <div className="row">
          <div className="col-lg-1" />
          <div className="col-lg-10">
            <SituationReportsByLanguage />
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * A React Server Component that provides a formatted list of various
 * resources for SARS-CoV-2 analysis and learning.
 */
function ResourceListing(): React.ReactElement {
  const contents: ResourceListEntry[] = [
    {
      type: "external",
      to: "/ncov/gisaid/global",
      title: "Latest global SARS-CoV-2 analysis (GISAID data)",
      subtext: (
        <span>
          Jump to our globally-subsampled SARS-CoV-2 dataset which is updated
          daily using data from GISAID. We also maintain additional analyses to
          focus subsampling on different geographic regions and different time
          periods. These include analyses that focus on the previous 6 months
          for
          <a href="/ncov/gisaid/africa/6m?f_region=Africa"> Africa</a>,
          <a href="/ncov/gisaid/asia/6m?f_region=Asia"> Asia</a>,
          <a href="/ncov/gisaid/europe/6m?f_region=Europe"> Europe</a>,
          <a href="/ncov/gisaid/north-america/6m?f_region=North%20America">
            {" "}
            North America
          </a>
          ,<a href="/ncov/gisaid/oceania/6m?f_region=Oceania"> Oceania</a> and
          <a href="/ncov/gisaid/south-america/6m?f_region=South%20America">
            {" "}
            South America
          </a>
          , as well as analyses that focus on the entire pandemic for
          <a href="/ncov/gisaid/africa/all-time?f_region=Africa"> Africa</a>,
          <a href="/ncov/gisaid/asia/all-time?f_region=Asia"> Asia</a>,
          <a href="/ncov/gisaid/europe/all-time?f_region=Europe"> Europe</a>,
          <a href="/ncov/gisaid/north-america/all-time?f_region=North%20America">
            {" "}
            North America
          </a>
          ,<a href="/ncov/gisaid/oceania/all-time?f_region=Oceania">
            {" "}
            Oceania
          </a>{" "}
          and
          <a href="/ncov/gisaid/south-america/all-time?f_region=South%20America">
            {" "}
            South America
          </a>
          .
        </span>
      ),
    },
    {
      type: "external",
      to: "/ncov/open/global",
      title: "Latest global SARS-CoV-2 analysis (open data)",
      subtext: (
        <span>
          Jump to our globally-subsampled SARS-CoV-2 dataset which is updated
          daily using open data from GenBank. Additional analyses that focus
          subsampling on different geographic regions and different time periods
          include analyses that focus on the previous 6 months for
          <a href="/ncov/open/africa/6m?f_region=Africa"> Africa</a>,
          <a href="/ncov/open/asia/6m?f_region=Asia"> Asia</a>,
          <a href="/ncov/open/europe/6m?f_region=Europe"> Europe</a>,
          <a href="/ncov/open/north-america/6m?f_region=North%20America">
            {" "}
            North America
          </a>
          ,<a href="/ncov/open/oceania/6m?f_region=Oceania"> Oceania</a> and
          <a href="/ncov/open/south-america/6m?f_region=South%20America">
            {" "}
            South America
          </a>
          , as well as analyses that focus on the entire pandemic for
          <a href="/ncov/open/africa/all-time?f_region=Africa"> Africa</a>,
          <a href="/ncov/open/asia/all-time?f_region=Asia"> Asia</a>,
          <a href="/ncov/open/europe/all-time?f_region=Europe"> Europe</a>,
          <a href="/ncov/open/north-america/all-time?f_region=North%20America">
            {" "}
            North America
          </a>
          ,<a href="/ncov/open/oceania/all-time?f_region=Oceania">
            {" "}
            Oceania
          </a>{" "}
          and
          <a href="/ncov/open/south-america/all-time?f_region=South%20America">
            {" "}
            South America
          </a>
          .
        </span>
      ),
    },
    {
      type: "external",
      to: "https://clades.nextstrain.org",
      title: "Nextclade (sequence analysis webapp)",
      subtext:
        "Drag and drop your sequences to assign them to clades, report potential sequence quality issues and view samples on a phylogenetic tree",
    },
    {
      type: "external",
      to: "https://covariants.org/",
      title: "CoVariants (mutations and variants of interest)",
      subtext:
        "An overview of SARS-CoV-2 variants, their prevalence around the world and constituent mutations",
    },
    {
      type: "external",
      to: "/sars-cov-2/forecasts",
      title: "SARS-CoV-2 variant growth rates and frequency forecasts",
      subtext:
        "Historical changes in frequency of SARS-CoV-2 variants are used to estimate variant growth rates and forecast changes in frequency",
    },
    {
      type: "external",
      to: "https://docs.nextstrain.org/projects/ncov/",
      title: "How to run your own phylogenetic analysis of SARS-CoV-2",
      subtext:
        "A tutorial walking through running your own analysis using Nextstrain tools",
    },
    {
      type: "anchor",
      to: "datasets",
      title: "Scroll down to all available datasets",
    },
    {
      type: "anchor",
      to: "sit-reps",
      title: "Scroll down to all available interactive situation reports",
    },
  ];

  return (
    <FlexCenter>
      <div className={styles.listContainer}>
        <ul>
          {contents.map(
            (s: ResourceListEntry): React.ReactElement => (
              <li key={s.to}>
                {s.type === "external" ? (
                  <a href={s.to}>{s.title}</a>
                ) : s.type === "anchor" ? (
                  <a href={`#${s.to}`}>{s.title}</a>
                ) : null}
                {s.subtext && <div className={styles.subtext}>{s.subtext}</div>}
              </li>
            ),
          )}
        </ul>
      </div>
    </FlexCenter>
  );
}

/**
 * The dataset-select (dataset filter) component requires certain
 * properties.
 *
 * We are still using a manually-curated YAML for sars-cov-2 datasets
 * which has a special format that doesn't have some of those
 * properties so we try to add them in here.
 */
function _parseDatasetsFilterList(datasets: DatasetType[]): DatasetType[] {
  return datasets
    .filter((d: DatasetType): boolean =>
      Object.prototype.hasOwnProperty.call(d, "url"),
    )
    .map((dataset: DatasetType): DatasetType => {
      dataset.filename = dataset.url
        .replace(/^.*?\/\//, "") // prefix and double slash
        .replace(/^.*?\//, "") // everything up to and including first / (after removing prefix slashes, so should just be dataset path)
        .replace("groups/", "")
        .replace("community/", "")
        .replace(/\?.*$/g, "") // query
        .replace(/\/$/g, "") // trailing slash
        .replace(/\//g, "_");

      if (dataset.filename === "") {
        dataset.filename = dataset.name;
      }

      dataset.contributor = get(dataset, "org.name");
      dataset.contributorUrl = get(dataset, "org.url");

      return dataset;
    });
}
