import React from "react";
import Helmet from "react-helmet";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import SitRepCards from "../components/Cards/sitreps";
import { FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import { isoLangs } from "../components/Cards/languages";

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.handleError = this.handleError.bind(this);
    this.sitRepCards = this.sitRepCards.bind(this);
  }

  sitRepCards(json) {
    const narratives = json.narratives;
    if (narratives === undefined) {
      console.log("No narratives returned");
      return null;
    }
    const narrativesByLanguage = Object.assign({}, isoLangs);
    narratives
      .map((o) => "/"+o.request)
      .filter((o) => o.startsWith("/narratives/ncov/sit-rep/"))
      .forEach((url) => {
        // here we're relying on the URLs all adhering to an unspoken scheme
        // todo: make this more robust (catch errors)
        const parts = url.replace("/narratives/ncov/sit-rep/", "").split("/");
        let name;
        let language;
        if (parts.length === 1) {
          name = parts[0];
          language = "en";
        } else if (parts.length === 2) {
          language = parts[0];
          name = `${parts[1]} (${language.toUpperCase()})`;
        } else {
          console.warn("Unforseen narrative url", url);
          return null;
        }
        const narrative = {
          img: null,
          url,
          title: name
        };
        if (narrativesByLanguage[language].narratives) narrativesByLanguage[language].narratives.push(narrative);
        else narrativesByLanguage[language].narratives = [narrative];
        return null;
      });
    return Object.values(narrativesByLanguage).filter(language => language.narratives !== undefined && language.narratives.length > 0);
  }

  handleError(response) {
    if (!response.ok) {
      throw new Error(`Failed to fetch available situation report narratives from /charon/getAvailable: ${response.status} ${response.statusText}`);
    }
    return response;
  }

  componentDidMount() {
    fetch(`/charon/getAvailable`)
      .then(this.handleError)
      .then((res) => res.json())
      .then((json) => { this.setState({ narrativesByLanguage: this.sitRepCards(json) });})
      .catch(error => {throw error;}); // TODO: this catches all errors from above steps, which we might want to handle more specifically
  }

  render() {
    return (
      <MainLayout>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <main>
            <NavBar location={this.props.location} />
            {this.state && this.state.narrativesByLanguage ? (
              <splashStyles.Container className="container">
                <FlexCenter>
                  <splashStyles.H1>
                  All ncov situation reports by language:
                  </splashStyles.H1>
                </FlexCenter>
                <SitRepCards narrativesByLanguage={this.state.narrativesByLanguage} defaultImg="ncov_narrative.png"/>
              </splashStyles.Container>

            ) : null}

          </main>
        </div>
      </MainLayout>
    );
  }
}

export default Index;
