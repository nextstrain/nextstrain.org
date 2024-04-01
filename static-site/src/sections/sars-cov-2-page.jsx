// We use <a> elements not <Link> because the links here need to go to the server which will then send the Auspice entrypoint
/* eslint-disable @next/next/no-html-link-for-pages */

import React from "react";
// import ScrollableAnchor, { configureAnchors } from "react-scrollable-anchor";
import { MdPerson } from "react-icons/md";
import { get } from 'lodash';
import {
  SmallSpacer,
  MediumSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import DatasetSelect from "../components/Datasets/dataset-select";
// import DatasetMap from "../components/Datasets/dataset-map";
import { SituationReportsByLanguage } from "../components/Datasets/situation-reports-by-language";
import { PathogenPageIntroduction } from "../components/Datasets/pathogen-page-introduction";
import {parseNcovSitRepInfo} from "../../../auspice-client/customisations/languageSelector";
import sarscov2Catalogue from "../../content/SARS-CoV-2-Datasets.yaml";
import GenericPage from "../layouts/generic-page";
import { ErrorBanner } from "../components/splash/errorMessages";
import { withRouter } from 'next/router'

const nextstrainLogoPNG = "/favicon.png";


const title = "Nextstrain SARS-CoV-2 resources";
const abstract = `Labs from all over the world are sequencing SARS-CoV-2 and sharing genomic data.
The Nextstrain team analyzes these data on a global and continental level. More specific analyses
are often performed by public health and academic groups from around the world. This page lists a
sample of such analyses. In addition to exploring SARS-CoV-2 evolution in finished analyses, you can
use Nextclade to compare your sequences to the SARS-CoV-2 reference genome, assign them to clades,
and see where they fall on a SARS-CoV-2 phylogeny.`;

const contents = [
  {
    type: "external",
    to: "/ncov/gisaid/global",
    title: "Latest global SARS-CoV-2 analysis (GISAID data)",
    subtext: (
      <span>
        Jump to our globally-subsampled SARS-CoV-2 dataset which is updated
        daily using data from GISAID. We also maintain additional analyses to
        focus subsampling on different geographic regions and different time
        periods. These include analyses that focus on the previous 6 months for
        <a href="/ncov/gisaid/africa/6m?f_region=Africa"> Africa</a>,
        <a href="/ncov/gisaid/asia/6m?f_region=Asia"> Asia</a>,
        <a href="/ncov/gisaid/europe/6m?f_region=Europe"> Europe</a>,
        <a href="/ncov/gisaid/north-america/6m?f_region=North%20America"> North America</a>,
        <a href="/ncov/gisaid/oceania/6m?f_region=Oceania"> Oceania</a> and
        <a href="/ncov/gisaid/south-america/6m?f_region=South%20America"> South America</a>,
        as well as analyses that focus on the entire pandemic for
        <a href="/ncov/gisaid/africa/all-time?f_region=Africa"> Africa</a>,
        <a href="/ncov/gisaid/asia/all-time?f_region=Asia"> Asia</a>,
        <a href="/ncov/gisaid/europe/all-time?f_region=Europe"> Europe</a>,
        <a href="/ncov/gisaid/north-america/all-time?f_region=North%20America"> North America</a>,
        <a href="/ncov/gisaid/oceania/all-time?f_region=Oceania"> Oceania</a> and
        <a href="/ncov/gisaid/south-america/all-time?f_region=South%20America"> South America</a>.
      </span>
    )
  },
  {
    type: "external",
    to: "/ncov/open/global",
    title: "Latest global SARS-CoV-2 analysis (open data)",
    subtext: (
      <span>
        Jump to our globally-subsampled SARS-CoV-2 dataset which is updated
        daily using open data from GenBank. Additional analyses that focus
        subsampling on  different geographic regions and different time periods
        include analyses that focus on the previous 6 months for
        <a href="/ncov/open/africa/6m?f_region=Africa"> Africa</a>,
        <a href="/ncov/open/asia/6m?f_region=Asia"> Asia</a>,
        <a href="/ncov/open/europe/6m?f_region=Europe"> Europe</a>,
        <a href="/ncov/open/north-america/6m?f_region=North%20America"> North America</a>,
        <a href="/ncov/open/oceania/6m?f_region=Oceania"> Oceania</a> and
        <a href="/ncov/open/south-america/6m?f_region=South%20America"> South America</a>,
        as well as analyses that focus on the entire pandemic for
        <a href="/ncov/open/africa/all-time?f_region=Africa"> Africa</a>,
        <a href="/ncov/open/asia/all-time?f_region=Asia"> Asia</a>,
        <a href="/ncov/open/europe/all-time?f_region=Europe"> Europe</a>,
        <a href="/ncov/open/north-america/all-time?f_region=North%20America"> North America</a>,
        <a href="/ncov/open/oceania/all-time?f_region=Oceania"> Oceania</a> and
        <a href="/ncov/open/south-america/all-time?f_region=South%20America"> South America</a>.
      </span>
    )
  },
  {
    type: "external",
    to: "https://clades.nextstrain.org",
    title: "Nextclade (sequence analysis webapp)",
    subtext: "Drag and drop your sequences to assign them to clades, report potential sequence quality issues and view samples on a phylogenetic tree"
  },
  {
    type: "external",
    to: "https://covariants.org/",
    title: "CoVariants (mutations and variants of interest)",
    subtext: "An overview of SARS-CoV-2 variants, their prevalence around the world and constituent mutations"
  },
  {
    type: "external",
    to: "/sars-cov-2/forecasts",
    title: "SARS-CoV-2 variant growth rates and frequency forecasts",
    subtext: "Historical changes in frequency of SARS-CoV-2 variants are used to estimate variant growth rates and forecast changes in frequency"
  },
  {
    type: "external",
    to: "https://docs.nextstrain.org/projects/ncov/",
    title: "How to run your own phylogenetic analysis of SARS-CoV-2",
    subtext: "A tutorial walking through running your own analysis using Nextstrain tools"
  },
  {
    type: "anchor",
    to: "datasets",
    title: "Scroll down to all available datasets"
  },
  {
    type: "anchor",
    to: "sit-reps",
    title: "Scroll down to all available interactive situation reports",
  }
];

const tableColumns = [
  {
    name: "Dataset",
    value: (dataset) => dataset.filename.replace(/_/g, ' / ').replace('.json', ''),
    url: (dataset) => dataset.url
  },
  {
    name: "Contributor",
    value: (dataset) => dataset.contributor,
    valueMobile: () => "",
    url: (dataset) => dataset.contributorUrl,
    logo: (dataset) => dataset.contributor==="Nextstrain Team" ?
      <img alt="nextstrain.org" className="logo" width="24px" src={nextstrainLogoPNG}/> :
      undefined,
    logoMobile: (dataset) => dataset.contributor==="Nextstrain Team" ?
      <img alt="nextstrain.org" className="logo" width="24px" src={nextstrainLogoPNG}/> :
      <MdPerson/>
  }
];

class Index extends React.Component {
  constructor(props) {
    super(props);
    // configureAnchors({ offset: -10 });
    this.state = {
      catalogueDatasets: sarscov2Catalogue.datasets,
      filterParsed: false
    };
  }

  componentDidMount() {
    let filterList;
    let filterParsed = false;
    try {
      filterList = parseDatasetsFilterList(this.state.catalogueDatasets);
      filterParsed = true;
    } catch (err) {
      console.error("Error parsing data.", err.message);
    }
    this.setState({
      filterList,
      filterParsed,
    });
  }

  componentDidUpdate() {
    if (!this.state.resourcePath) {
      if (this.props.router.query?.['sars-cov-2']) {
        this.setState({resourcePath: "sars-cov-2/" + this.props.router.query['sars-cov-2'].join("/")});
      } else if (this.props.router.query?.ncov) {
        this.setState({resourcePath: "ncov/" + this.props.router.query.ncov.join("/")});
      }
    }
  }

  banner() {
    if (this.state.resourcePath) {
      const bannerTitle = `The dataset "nextstrain.org/${this.state.resourcePath}" doesn't exist.`;
      const bannerContents = (<>
        {`Here is the SARS-CoV-2 page, where we have listed featured datasets,
        narratives, and resources related to SARS-CoV-2. Note that some SARS-CoV-2
        datasets may not be listed here. For a more comprehensive list of
        Nextstrain-maintained (including SARS-CoV-2) datasets,
        check out `}
        <a href="/pathogens">nextstrain.org/pathogens</a>.
      </>);
      return <ErrorBanner title={bannerTitle} contents={bannerContents}/>;
    }
    return null;
  }

  render() {
    const banner = this.banner();
    return (
      <GenericPage location={this.props.location} banner={banner}>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>
        <MediumSpacer />

        <PathogenPageIntroduction data={contents} />

        {/* <ScrollableAnchor id={"datasets"}> */}
          <div>
            <HugeSpacer /><HugeSpacer />
            <splashStyles.H2 $left>
              All SARS-CoV-2 datasets
            </splashStyles.H2>
            <SmallSpacer />
            <splashStyles.FocusParagraph>
              This section is an index of public Nextstrain datasets for SARS-CoV-2, organized by geography.
              Some of these datasets are maintained by the Nextstrain team and others are maintained by independent research groups.
              If you know of a dataset not listed here, please let us know!
              Please note that inclusion on this list does not indicate an endorsement by the Nextstrain team.
            </splashStyles.FocusParagraph>

            <HugeSpacer/>
            {this.state.filterParsed && (
              <DatasetSelect
                datasets={this.state.filterList}
                columns={tableColumns}
                interface={[
                  // DatasetMap,
                  "FilterSelect",
                  "FilterDisplay",
                  "ListDatasets"
                ]}
              />
            )}

          </div>
        {/* </ScrollableAnchor> */}

        {/* <ScrollableAnchor id={"sit-reps"}> */}
          <div>
            <HugeSpacer /><HugeSpacer />
            <splashStyles.H2 $left>
              All SARS-CoV-2 situation reports
            </splashStyles.H2>
            <SmallSpacer />
            <splashStyles.FocusParagraph>
              We have been writing interactive situation reports
              using <a href="https://nextstrain.github.io/auspice/narratives/introduction">Nextstrain Narratives </a>
              to communicate how COVID-19 is moving around the world and spreading locally.
              These are kindly translated into a number of different languages by volunteers
              and Google-provided translators — click on any language below to see the list of situation reports available.
            </splashStyles.FocusParagraph>
            <div className="row">
              <MediumSpacer />
              <div className="col-md-1"/>
              <div className="col-md-10">
                <SituationReportsByLanguage parseSitRepInfo={parseNcovSitRepInfo}/>
              </div>
            </div>
          </div>
        {/* </ScrollableAnchor> */}
      </GenericPage>
    );
  }
}

// The dataset-select (dataset filter) component
// requires certain properties.
// We are still using a manually-curated YAML
// for sars-cov-2 datasets which has a special
// format that doesn't have some of those
// properties so we try to add them in here.
function parseDatasetsFilterList(datasets) {
  return datasets
  .filter((d) => d.url)
  .map((dataset) => {
    dataset.filename = dataset.url
    .replace(/^.*?\/\//, '') // prefix and double slash
    .replace(/^.*?\//, '') // everything up to and including first / (after removing prefix slashes, so should just be dataset path)
    .replace('groups/', '')
    .replace('community/', '')
    .replace(/\?.*$/g, '') // query
    .replace(/\/$/g, '') // trailing slash
    .replace(/\//g, '_');
    if (dataset.filename === '') dataset.filename = dataset.name;
    dataset.contributor = get(dataset, "org.name");
    dataset.contributorUrl = get(dataset, "org.url");
    return dataset;
  });
}

export default withRouter(Index);
