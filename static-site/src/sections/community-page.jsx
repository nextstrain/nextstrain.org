import React from "react";
import { Link } from "gatsby";
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
    <Link to="/groups"> Scalable Sharing with Nextstrain Groups</Link>.
  </>
);

const tableColumns = [
  {
    name: "name",
    value: (entry) => entry.name,
    url: (entry) => entry.url.replace(/.*nextstrain.org/, '')
  },
  {
    name: "Type",
    value: (entry) => entry.isNarrative ? 'Narrative' : 'Dataset'
  }, {
    name: "GitHub Repo",
    value: (entry) => `${entry.githubOrg}/${entry.githubRepo}`,
    url: (entry) => `https://github.com/${entry.githubOrg}/${entry.githubRepo}`
  }
];
const tableData = parseTableData(hardcodedData);

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // For some reason if this is set in the constructor it breaks the banner.
    this.setState({nonExistentPath: this.props["*"]});
  }

  banner() {
    if (this.state.nonExistentPath && (this.state.nonExistentPath.length > 0)) {
      const bannerTitle = `The community repository, dataset, or narrative "nextstrain.org${this.props.location.pathname}" doesn't exist.`;
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
        <DatasetSelect
          title="Search Community Datasets and Narratives "
          datasets={tableData}
          columns={tableColumns}
          rowSort={[]}
        />
      </GenericPage>
    );
  }
}

export default Index;


function parseTableData(yamlData) {
  return yamlData.data
    .map((entry) => {
      /* does the URL look like a valid community URL structure? We modify this in-place
      to remove a leading nextstrain.org domain name, as needed */
      let url = entry.url.replace(/.*nextstrain.org/, '');
      if (!url.startsWith("/")) url = `/${url}`;
      const urlFields = url.split("/")
        .slice(1); // remove first empty entry, as we ensure a leading slash
      if (
        urlFields.length < 3 || // minimum community URL is /community/org/repo
        urlFields[0] !== "community" ||
        (urlFields[1] === "narratives" && urlFields.length < 4) // narratives URLs need at least 4 parts
      ) {
        console.warn(`Removing data entry "${entry.name}" as URL is not valid`);
        return undefined;
      }
      const d = {...entry};
      d.url = url;
      d.githubOrg = d.isNarrative ? urlFields[2] : urlFields[1];
      d.githubRepo = d.isNarrative ? urlFields[3] : urlFields[2];
      /* is the entry a dataset or a narrative?
      NOTE that we cannot currently distinguish if a URL /community/org/repo
      is a "default" dataset or loads the splash page. In hindsight I wish I hadn't
      implemented "defaults" but that's what I did.             james 2022 */
      d.isNarrative = urlFields[1]==="narratives";
      return d;
    })
    .filter((entry) => entry!==undefined);
}
