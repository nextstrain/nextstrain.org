import React from "react";
import styled from "styled-components";
import ScrollableAnchor, { configureAnchors } from "react-scrollable-anchor";
import {
  SmallSpacer,
  MediumSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import Cards from "../components/Cards/index";

const title = "Monkeypox Virus";
const subtitle = "Open data sharing and phylogenetic analysis";
const abstract = (<>
  Researchers from around the world are rapidly sequencing genomes from the 2022 Monkeypox outbreak.
  These genomes are kindly being shared through platforms such as GenBank to aid scientific understanding.
  This page details our efforts to publicly curate metadata, make the data available for others to use, and maintain an up-to-date phylogenetic analyses.
  <ul/>
  This page details the main aspects of the open data sharing which is currently happening, and explains how to access data:
  <ol>
    <li>Genome sequencing by groups around the world with data shared openly</li>
    <li>Open source metadata curation through Nextstrain</li>
    <li>Easy access to data via LAPIS</li>
    <li>Up-to-date phylogenetic analysis using Nextstrain and other tools</li>
  </ol>
  <br/>
  NOTE: These genomes have been generated and shared extremely rapidly, in most cases before any journal article has been written.
  Please reach out and contact the original submitters (listed below) before publishing analyses using their data 🙏
</>);

const cards = [
  {
    img: "monkeypox.png",
    url: "/monkeypox", // TODO - move dataset to /monkeypox/overview?!?
    title: "Monkeypox phylogeny"
  },
];

const paragraphs = [
  {
    id: "genome-sequencing",
    title: "1. Sharing of Genomes",
    contents: <>
      Reserchers have been pushing open data access by releasing their sequences to platforms such as
      <a href="https://virological.org"> virological</a> (including the first genome from this outbreak:
      <a href="https://virological.org/t/first-draft-genome-sequence-of-monkeypox-virus-associated-with-the-suspected-multi-country-outbreak-may-2022-confirmed-case-in-portugal/799"> Isidro <i>et al.,</i> May 20 2022</a>) as well as submitting sequence data to
      <a href="https://www.ncbi.nlm.nih.gov/genbank/"> GenBank</a>, an open-access repository.
      This sharing has enabled a wide range of downstream tools and analyses, as well as improving
      our understanding of the current outbreak. Please reach out and contact the original submitters (listed below) before publishing analyses using their data 🙏
      <br/><br/>
      If you have genomic data to contribute we recommend submitting to GenBank or sharing via a short post on Virological.
      These data will then be automatically picked up and be included in subsequent analyses.
    </>
  },
  {
    id: "metadata-curation",
    title: "2. Nextstrain's open source metadata curation",
    contents: (<>
      As part of our efforts with SARS-CoV-2 we maintained a curation layer to help standardize metadata fields.
      We have leveraged this approach for Monkeypox via the <a href="https://github.com/nextstrain/monkeypox">github/nextstrain/monkeypox</a> repo.
      This pulls all available data from GenBank on a daily basis, and performs a series of steps to
      clean up the metadata and facilitate downstream analyses. Some of these steps are automated and some rely on
      manually maintained lookup tables.
      This pipeline is fully open-source and we welcome comments and contributions!
      See <a href="TKTK">the documentation</a> for more.
    </>)
  },
  {
    id: "api",
    title: "3. Easy API access to data via LAPIS",
    contents: (<>
      The curated data described above is made available via the LAPIS API (originally developed for SARS-CoV-2 and used by CoV-Spectrum).
      This allows easy access to the data and is designed for both researchers looking for an easy entry point into the data as well as for programmatic access.
      <br/>
      The API allows you to download the entire dataset, or to filter on a number of fields (as well as to aggregate the data to avoid downloading the individual sequences). There is extensive documentation at
      <a href="https://mpox-lapis.genspectrum.org/docs/#aggregation"> genSpectrum</a>, however here are some quick links to highlight the capabilities:
      <ul>
        <li>🧬 All sequences (aligned): <a href="https://mpox-lapis.gen-spectrum.org/v1/sample/fasta-aligned"><code>mpox-lapis.gen-spectrum.org/v1/sample/fasta-aligned</code></a></li>
        <li>📋 All metadata (CSV): <a href="https://mpox-lapis.gen-spectrum.org/v1/sample/details?dataFormat=csv"><code>mpox-lapis.gen-spectrum.org/v1/sample/details?dataFormat=csv</code></a></li>
      </ul>
    </>)
  },
  {
    id: 'phylogeny',
    title: '4. Continually maintained phylogenetic analysis',
    contents: <>
      We regenerate the analysis whenever new data is available with the intention of providing a up-to-date snapshot
      of both the evolutionary history of Monkeypox virus as well as of the current outbreak.
      The analysis pipeline is open source at our <a href="https://github.com/nextstrain/monkeypox">github/nextstrain/monkeypox</a> repo. The latest dataset can be visualised at <a href="/monkeypox">nextstrain.org/monkeypox</a>.
    </>
  },

  {
    id: 'acknowledgments',
    title: 'Data submitter acknowledgments',
    contents: <>
      TO DO - automate this by fetching the metadata TSV / pre-preparing such a CSV and fetching that?
      Or even better -- make a call to LAPIS to get this!!!
      <br/>
      If the number of genomes stays resonably small we could also implement a table view here listing all the data?
    </>
  },
  // {
  //   id: 'other-tools',
  //   title: 'Other tools and helpful links',
  //   contents: <>
  //     <ul>
  //       <li>tktk</li>
  //     </ul>
  //   </>
  // },
  {
    id: 'assets',
    title: 'Flat files available for download',
    contents: (<>
      Generally, the LAPIS API should provide data in a convenient format, however the following flat files are also
      available and regenerated on a daily basis:
      <ul>
        <li>📦  Metadata (curated, TSV format) <code>s3://nextstrain-data/files/workflows/monkeypox/metadata.tsv.gz</code></li>
        <li>📦  Sequences (curated, FASTA format) <code>s3://nextstrain-data/files/workflows/monkeypox/sequences.fasta.xz</code></li>
        <li>📦  Alignment (curated, FASTA format) <code>TKTK</code></li>
        <li>📦  Metadata (un-curated, JSON) <code>s3://nextstrain-data/files/workflows/monkeypox/genbank.ndjson.xz</code></li>
        <li>📦  Sequences (un-curated, JSON) <code>s3://nextstrain-data/files/workflows/monkeypox/all_sequences.ndjson.xz</code></li>
      </ul>
    </>)
  }

];

class Index extends React.Component {
  constructor(props) {
    super(props);
    configureAnchors({ offset: -10 });
  }
  render() {
    return (
      <GenericPage location={this.props.location}>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />
        <splashStyles.H3>{subtitle}</splashStyles.H3>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>
        <MediumSpacer />

        <FlexCenter>
          <Cards cards={cards}/>
        </FlexCenter>
        <HugeSpacer/>

        {paragraphs.map((p) => (
          <Paragraph>
            <ScrollableAnchor id={p.id}>
              <ParagraphTitle>{p.title}</ParagraphTitle>
            </ScrollableAnchor>
            {p.contents}
            <HugeSpacer/>
          </Paragraph>
        ))}

      </GenericPage>
    );
  }
}

const ParagraphTitle = styled.div`
  text-align: left;
  font-size: 20px;
  line-height: 32px;
  font-weight: 500;
  color: #333;
  min-width: 240px;
  margin-top: 0px;
  margin-bottom: 10px;
`;
const Paragraph = styled.div`
  font-size: ${(props) => props.theme.niceFontSize};
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: 300;
  color: ${(props) => props.theme.darkGrey};
  line-height: ${(props) => props.theme.tightLineHeight};
`;

export default Index;
