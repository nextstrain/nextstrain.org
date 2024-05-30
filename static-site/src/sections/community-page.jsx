import React from "react";
import { InternalLink } from "../components/Misc/internal-link";
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import { ErrorBanner } from "../components/splash/errorMessages";
import hardcodedData from "../../content/community-datasets.yaml";
import DatasetSelect from "../components/Datasets/dataset-select";

const title = "Nextstrain Community: Data Sharing via GitHub";
const abstract = (
  <>
    We allow researchers to share their analyses through nextstrain.org by storing the results of their analysis in their own
    <a href="https://github.com/"> GitHub repositories</a>.
    This gives you complete control, ownership, and discretion over your data; there is no need to get in touch with the Nextstrain team to share your data this way.
    For more details, including instructions on what file formats and naming conventions to use,
    <a href="https://docs.nextstrain.org/en/latest/guides/share/community-builds.html"> please see our documentation</a>.
    <br/>
    <br/>
    The table below contains Datasets and Narratives which have been made publicly available.
    To add yours to the table below please make a Pull Request to add it
    <a href="https://github.com/nextstrain/nextstrain.org/blob/master/static-site/content/community-datasets.yaml"> to this file.</a>
    For further details about the analyses below, please contact the authors.
    <br/>
    <br/>
    P.S. For an alternative approach to sharing data through nextstrain.org which is allows larger datasets and/or private data sharing, see
    <InternalLink href="/groups"> Scalable Sharing with Nextstrain Groups</InternalLink>.
  </>
);

const tableColumns = [
  {
    name: "Name",
    value: (entry) => entry.urlDisplayName.replace(/\//g, ' / '),
    url: (entry) => entry.url.replace(/.*nextstrain.org/, '')
  },
  {
    name: "Maintainer",
    value: (entry) => entry.maintainers || 'Unknown'
  }
];
const tableData = parseTableData(hardcodedData);
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loaded: false};
    /**
     * The <DatasetSelect> component is typically loaded after a delay (while data is fetched).
     * On this page, the data is hardcoded & thus there is no need for a delay, however this
     * results in the info-hover box flashing on load and then having incorrect styling when
     * in use. Using a timeout is not pretty, but as we will eventually move away from Gatsby
     * I don't want to spend time debugging this (note that you can't reproduce this in
     * dev mode).                                                          james, april 2022
     */
    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.setState({loaded: true}), 0);
    }
  }

  banner() {
    if (this.props.resourcePath && this.props.resourcePath!=='community/narratives') {
      const bannerTitle = `The community repository, dataset, or narrative "nextstrain.org/${this.props.resourcePath}" doesn't exist.`;
      const bannerContents = `Here is the community page instead.`;
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
        <HugeSpacer />
        <HugeSpacer />
        {this.state.loaded && <DatasetSelect
          title="Search Community Datasets and Narratives "
          datasets={tableData}
          columns={tableColumns}
          rowSort={[]}
        />}
      </GenericPage>
    );
  }
}

export default Index;


function parseTableData(yamlData) {
  const communityUrlPattern = new RegExp("^/community(?<narrative>/narratives)?/(?<org>[^/]+)/(?<repo>[^/]+)(?<pathSuffix>/.*)?");
  return yamlData.data
    .map((entry) => {
      const url = new URL(entry.url, "https://nextstrain.org");
      const urlMatches = url.pathname.match(communityUrlPattern);

      if (!urlMatches) {
        console.warn(`Removing data entry "${entry.name}" as URL <${entry.url}> is not valid`);
        return undefined;
      }

      return {
        ...entry,
        url: url.pathname,
        /* is the entry a dataset or a narrative?
        NOTE that we cannot currently distinguish if a URL /community/org/repo
        is a "default" dataset or loads the splash page. In hindsight I wish I hadn't
        implemented "defaults" but that's what I did.             james 2022 */
        isNarrative: !!urlMatches.groups.narrative,
        githubOrg: urlMatches.groups.org,
        githubRepo: urlMatches.groups.repo,
        /* urlDisplayName is the URL name, less the /community or /community/narratives parts */
        urlDisplayName: `${urlMatches.groups.org}/${urlMatches.groups.repo}${urlMatches.groups.pathSuffix || ''}`,
      };
    })
    .filter((entry) => entry!==undefined);
}
