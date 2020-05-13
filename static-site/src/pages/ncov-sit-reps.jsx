import React from "react";
import Helmet from "react-helmet";
import Collapsible from "react-collapsible";
import _sortBy from "lodash/sortBy";
import {FaFile} from "react-icons/fa";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import UserDataWrapper from "../layouts/userDataWrapper";
import { SmallSpacer, MediumSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import Footer from "../components/Footer";
import CollapseTitle from "../components/Misc/collapse-title";
import {parseNcovSitRepInfo} from "../../../auspice-client/customisations/languageSelector";

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
    this.handleError = this.handleServerError.bind(this);
    this.sitRepCards = this.getNarrativesByLanguage.bind(this);
  }

  getNarrativesByLanguage(json) {
    const narrativesByLanguage = {};
    json.narratives
      .filter((o) => o.request)
      .map((o) => o.request)
      .map(parseNcovSitRepInfo)
      .filter((sitrep) => sitrep !== null)
      .forEach((sitrep) => {
        sitrep.url = "/"+sitrep.url;
        if (narrativesByLanguage[sitrep.languageCode]) {
          narrativesByLanguage[sitrep.languageCode].narratives.push(sitrep);
        } else {
          narrativesByLanguage[sitrep.languageCode] = {
            languageCode: sitrep.languageCode,
            languageNative: sitrep.languageNative,
            narratives: [sitrep]
          };
        }
      });
    const languageObjects = Object.values(narrativesByLanguage);
    // sort most recent dates first within each language
    languageObjects.forEach((l) => {
      l.narratives.sort().reverse();
    });
    // English first then by language code
    return _sortBy(languageObjects, [(o) => o.languageNative !== "English", (o) => o.languageCode]);
  }

  handleServerError(response) {
    if (!response.ok) {
      throw new Error(`Failed to fetch available situation report narratives from /charon/getAvailable: ${response.status} ${response.statusText}`);
    }
    return response;
  }

  componentDidMount() {
    fetch(`/charon/getAvailable`)
      .then(this.handleServerError)
      .then((res) => res.json())
      .then((json) => {
        this.setState({ narrativesByLanguage: this.getNarrativesByLanguage(json) });
      })
      .catch(error => {
        console.log("The following error occured during fetching or parsing situation reports:", error);
        this.setState({ hasError: true });
      });
  }

  render() {
    return (
      <MainLayout>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <main>

            <UserDataWrapper>
              <NavBar location={this.props.location} />
            </UserDataWrapper>

            <splashStyles.Container className="container">
              <HugeSpacer />
              <splashStyles.H2>
                All SARS-CoV-2 situation reports
              </splashStyles.H2>
              <SmallSpacer />
              <FlexCenter>
                <splashStyles.CenteredFocusParagraph theme={{niceFontSize: "14px"}}>
                  Each week we have been writing interactive situation reports
                  using <a href="https://nextstrain.github.io/auspice/narratives/introduction">Nextstrain Narratives </a>
                  to communicate how COVID-19 is moving around the world and spreading locally.
                  These are kindly translated into a number of different languages by volunteers
                  and Google-provided translators — click on any language below to see the list of situation reports available.
                </splashStyles.CenteredFocusParagraph>
              </FlexCenter>
              <div className="row">
                <MediumSpacer />
                <div className="col-md-1"/>
                <div className="col-md-10">
                  { this.state.hasError && <splashStyles.CenteredFocusParagraph>
                                  Something went wrong getting situation reports.
                                  Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a>
                                  if this continues to happen.</splashStyles.CenteredFocusParagraph>}
                  {/* Sit Reps */
                    !this.state.hasError &&
                    this.state.narrativesByLanguage &&
                    this.state.narrativesByLanguage.map((language) => (
                      <div key={language.languageNative}>
                        <Collapsible
                          triggerWhenOpen={<CollapseTitle name={language.languageNative} isExpanded />}
                          trigger={<CollapseTitle name={language.languageNative} />}
                          triggerStyle={{cursor: "pointer", textDecoration: "none"}}
                          open={language.languageNative === "English"} // start with English open. Later we can take this from browser settings using Jover's code?
                        >
                          {/* Begin collapsible content */}
                          <div className="row">
                            {Array.from(language.narratives.entries()).map(([index, narrative]) => (
                              <div className="col-sm-4">
                                <FlexCenter>
                                  <a href={narrative.url}>
                                    <splashStyles.SitRepTitle attn={index === 0}>
                                      <FaFile />
                                      {" "+narrative.date}
                                    </splashStyles.SitRepTitle>
                                  </a>
                                </FlexCenter>
                              </div>
                            ))}
                          </div>
                        </Collapsible>
                      </div>
                    ))}
                </div>
              </div>

              <Footer />

            </splashStyles.Container>
          </main>
        </div>
      </MainLayout>
    );
  }
}

export default Index;
