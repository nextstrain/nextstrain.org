import React from "react";
import type { Metadata } from "next";

import FlexCenter from "../../../components/flex-center";
import { FocusParagraphNarrow } from "../../../components/focus-paragraph";
import { HugeSpacer, SmallSpacer } from "../../../components/spacers";

import styles from "./styles.module.css";

const title = "Nextstrain SARS-CoV-2 Forecasts";

export const metadata: Metadata = {
  title,
};

/**
 * React Server Component that wraps an <iframe> that displays
 * information about Covid models
 */
export default function SarsCov2Forecasts(): React.ReactElement {
  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      <h1>{title}</h1>

      <SmallSpacer />

      <FlexCenter>
        <FocusParagraphNarrow>
          Here we chart the change in frequency of SARS-CoV-2 variants over
          time. We use this change in frequency to estimate the relative growth
          advantage or evolutionary fitness of different variants. We apply a
          Multinomial Logistic Regression (MLR) model to estimate frequencies
          and growth advantages using daily sequence counts. We apply this model
          independently across different countries and partition SARS-CoV-2
          variants by{" "}
          <a href="https://nextstrain.org/blog/2022-04-29-SARS-CoV-2-clade-naming-2022">
            Nextstrain clades
          </a>{" "}
          and separately by{" "}
          <a href="https://cov-lineages.org/">Pango lineages</a>.
          <br />
          <br />
          Further details on data preparation and analysis can be found in the{" "}
          <a href="https://github.com/nextstrain/forecasts-ncov/">
            forecasts-ncov GitHub repo
          </a>
          , while further details on the MLR model implementation can be found
          in the{" "}
          <a href="https://www.github.com/blab/evofr">evofr GitHub repo</a>.
          Enabled by data from{" "}
          <a href="https://www.ncbi.nlm.nih.gov/genbank/">
            GenBank
          </a>
          .
          <br />
          <br />
          These analyses are the work of{" "}
          <a href="https://bedford.io/team/marlin-figgins/">
            Marlin Figgins
          </a>, <a href="https://bedford.io/team/jover-lee/">Jover Lee</a>,{" "}
          <a href="https://bedford.io/team/james-hadfield/">James Hadfield</a>,{" "}
          and{" "}
          <a href="https://bedford.io/team/trevor-bedford/">Trevor Bedford</a>.
          <br />
          <br />
          <i>
            Multinomial Logistic Regression is commonly used to model SARS-CoV-2
            variant frequencies. However, please apply caution in interpretation
            of these results.
          </i>
        </FocusParagraphNarrow>
      </FlexCenter>

      <HugeSpacer />

      <div className={styles.iframeContainer}>
        <iframe
          className={styles.iframeResponsive}
          src="https://nextstrain.github.io/forecasts-ncov/"
        ></iframe>
      </div>

      <FlexCenter>
        <FocusParagraphNarrow>
          We gratefully acknowledge the authors, originating and submitting
          laboratories of the genetic sequences and metadata made available
          through GenBank on which this research is based.
        </FocusParagraphNarrow>
      </FlexCenter>
    </>
  );
}
