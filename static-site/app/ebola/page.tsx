import React from "react";
import type { Metadata } from "next";

import FlexCenter from "../../components/flex-center";
import { HugeSpacer } from "../../components/spacers";
import TilesList from "../../components/tiles-list";
import { TilesListTile } from "../../components/tiles-list/types";

// We use <a> elements not <Link> because several links here need to go to the
// server which will then send the Auspice entrypoint
/* eslint-disable @next/next/no-html-link-for-pages */

const PAGE_TITLE = "Nextstrain Ebolavirus resources";

/**
 * Page metadata picked up by Next.js to populate the <head> (e.g. the
 * <title> tag). Note: This can only be exported from a Server Component.
 */
export const metadata: Metadata = {
  /** The title of the page */
  title: PAGE_TITLE,
};


/** The resources listed on the page, in display order */
const tiles: TilesListTile[] = [
  {
    img: "bdbv.jpg",
    title: "Ongoing Bundibugyo (BDBV) ebolavirus outbreak",
    url: "/ebola/bdbv-drc-uganda-2026",
    text: (
      <>
        <p>
          Near daily updates of our phylogeographic analysis of the third BDBV outbreak
          which started in early 2026.
          The majority of sequences are from Eastern DRC, with some from Uganda.

          {` This analysis is in partnership with `}
          <a href="https://inrb.net/">
            {'Institut National de Recherche Biomédicale (INRB)'}
          </a>
          , DRC.
        </p>
        <h4>Interactive narratives</h4>
        <p>
          We have written sit-rep style reports to provide high-level
          overviews of the outbreak:
        </p>
        <ul>
          <li>
            {'2026-09-01 '}
            <a href="/narratives/ebola/bdbv/drc-uganda-2026/2026-09-01">
              A phylogenetic summary of the ongoing BDBV outbreak
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    img: "ebola_streams.png",
    title: "Summary tree of all Ebola outbreaks",
    url: "/ebola/all-outbreaks",
    text: (
      <>
        <p>
          Evolutionary history of all sequenced Zaire ebolavirus (EBOV) outbreaks, the most
          recent of which was the 2025 Bulape (DRC) outbreak. 
        </p>
        <p>
          {'We also maintain a summary tree of '}
          <a href="/ebola/bdbv">
            the 3 sequenced Bundibugyo virus (BDBV) outbreaks.
          </a>
        </p>
      </>
    ),
  },
  {
    img: "ebola_drc_map.jpg",
    title: "Genomic epidemiology of the 2018-20 DRC Ebola epidemic",
    url: "/community/inrb-drc/ebola-nord-kivu",
    text: (
      <>
        <p>
          An updated version of the analysis in
          Kinganda-Lusamaki E
          <i> et al.</i>,
          &quot;Integration of genomic sequencing into the response to the Ebola virus outbreak in Nord Kivu, Democratic Republic of the Congo&quot;,
          Nature Medicine (2021)
          {' '}
          <a href="https://bedford.io/pdfs/papers/kinganda-lusamaki-ebola-drc.pdf">(PDF)</a>
        </p>
      </>
    ),
  },
  {
    img: "ebola_ebov-2013.png",
    title: "2013-2016 West African Ebola epidemic",
    url: "/ebola/ebov-2013",
    text: (
      <>
        <p>
          Genomic epidemiology of the 2013-2016 West African Ebola epidemic
        </p>
      </>
    ),
  },
  {
    img: "ebola_sudv.png",
    title: "Sudan ebolavirus genomes",
    url: "/ebola/sudv",
    text: (
      <span>
        Analysis of Sudan ebolavirus (SUDV) genomes
      </span>
    ),
  },
  {
    img: "ebola_github.png",
    title: "Data curation & phylogenetic workflows",
    url: "https://github.com/nextstrain/ebola",
    text: (
      <span>
        The GitHub repository with the workflows used to create all the analyses described above.
        {' See the '}
        <a href='https://github.com/nextstrain/ebola/tree/main/phylogenetic'>
          phylogenetic README
        </a>
        {' for instructions on how to install and run these analysis, '}
        with the ability to add private data to your builds.
        
      </span>
    ),
  },
];

/**
 * A React Server Component for `/ebola`
 */
export default function EbolaPage(): React.ReactElement {
  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      <h1>{PAGE_TITLE}</h1>

      <HugeSpacer />

      <FlexCenter>
        <TilesList tiles={tiles} />
      </FlexCenter>
    </>
  );
}
