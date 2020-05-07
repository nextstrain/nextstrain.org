import React from "react";
import Helmet from "react-helmet";
import Collapsible from "react-collapsible";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import { SmallSpacer, MediumSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import { isoLangs } from "../components/Cards/languages";
import UserDataWrapper from "../layouts/userDataWrapper";
import Footer from "../components/Footer";
import CollapseTitle from "../components/Misc/collapse-title";

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
      .catch(error => {throw error;}); // TODO: handle this using the component state to display nice error pages
  }

  render() {
    return (
      <MainLayout>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <main>
            <UserDataWrapper>

              <NavBar location={this.props.location} />

              {this.state && this.state.narrativesByLanguage &&
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

                  {/* Sit Reps */}
                  <div className="row">
                    <MediumSpacer />
                    <div className="col-md-1"/>
                    <div className="col-md-10">
                      {this.state.narrativesByLanguage.map((language) => (
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
              }
            </UserDataWrapper>
          </main>
        </div>
      </MainLayout>
    );
  }
}

export default Index;
