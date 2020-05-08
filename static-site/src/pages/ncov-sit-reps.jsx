import React from "react";
import Helmet from "react-helmet";
import Collapsible from "react-collapsible";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import { SmallSpacer, MediumSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import { isoLangs } from "../components/Cards/languages";
import Footer from "../components/Footer";
import CollapseTitle from "../components/Misc/collapse-title";

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
    this.handleError = this.handleServerError.bind(this);
    this.sitRepCards = this.getNarrativesByLanguageObject.bind(this);
  }

  getNarrativesByLanguageObject(json) {
    const narrativesByLanguage = Object.assign({}, isoLangs);
    json.narratives
      .filter((o) => o.request)
      .map((o) => "/"+o.request)
      .filter((o) => o.startsWith("/narratives/ncov/sit-rep/"))
      .map((url) => {
        try {
          // here we're relying on the URLs all adhering to an undocumented scheme
          // so we catch errors and filter out the narratives we couldn't parse
          const parts = url.replace("/narratives/ncov/sit-rep/", "").split("/");
          const sitrep = {url};
          if (parts.length === 1) {
            sitrep.language = "en";
            sitrep.title = parts[0];
          } else if (parts.length === 2) {
            sitrep.language = parts[0];
            sitrep.title = `${parts[1]} (${sitrep.language.toUpperCase()})`;
          } else {
            console.warn("Unforseen narrative url", url);
            return null;
          }
          return sitrep;
        } catch (err) {
          return null;
        }
      })
      .filter((sitrep) => sitrep !== null)
      .forEach((sitrep) => {
        // add sitreps to the returned object according to their language
        if (narrativesByLanguage[sitrep.language]) {
          if (narrativesByLanguage[sitrep.language].narratives) narrativesByLanguage[sitrep.language].narratives.push(sitrep);
          else narrativesByLanguage[sitrep.language].narratives = [sitrep];
        } else {
          console.warn("Language not recognized: ", sitrep.language);
        }
      });
    // return all the languages for which we have at least one narrative
    return Object.values(narrativesByLanguage).filter(language => language.narratives !== undefined && language.narratives.length > 0);
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
        this.setState({ narrativesByLanguage: this.getNarrativesByLanguageObject(json) });
      })
      .catch(error => {
        console.log("The following error occured during fetching or parsing situation reports:", error);
        this.setState({hasError: true});
      });
  }

  render() {
    return (
      <MainLayout>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <main>

            <NavBar location={this.props.location} />

            <splashStyles.Container className="container">
              <HugeSpacer />
              <splashStyles.H2>
                All SARS-CoV-2 situation reports
              </splashStyles.H2>
              <SmallSpacer />
              <FlexCenter>
                <splashStyles.CenteredFocusParagraph>
                  Each week we have been writing interactive situation reports
                  using <a href="https://nextstrain.github.io/auspice/narratives/introduction">Nextstrain Narratives </a>
                  to communicate how COVID-19 is moving around the world and spreading locally.
                  These are kindly translated into a number of different languages by volunteers
                  and Google — click on any language below to see the list of situation reports available.
                </splashStyles.CenteredFocusParagraph>
              </FlexCenter>
              <div className="row">
                <MediumSpacer />
                <div className="col-md-1"/>
                <div className="col-md-10">
                  { this.state.hasError && <splashStyles.H2>
                                  Something went wrong getting situation reports. Please
                                  contact us at hello@nextstrain.org if this continues to
                                  happen.</splashStyles.H2>}
                  {/* Sit Reps */
                    !this.state.hasError &&
                    this.state.narrativesByLanguage &&
                    this.state.narrativesByLanguage.map((language) => (
                      <div key={language.name}>
                        {/* TODO: seems like there is a better way to implement the different states of the collapsible title */}
                        <Collapsible triggerWhenOpen={<CollapseTitle title={`${language.nativeName}    -`}/>}
                          trigger={<CollapseTitle title={`${language.nativeName}    +`}/>}
                          triggerStyle={{cursor: "pointer"}}
                        >
                          {/* Begin collapsible content */}
                          <div className="row">
                            {language.narratives.map((narrative) => (
                              <div className="col-sm-4">
                                <FlexCenter>
                                  <a href={narrative.url}>
                                    <splashStyles.SitRepTitle>{narrative.title}</splashStyles.SitRepTitle>
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
