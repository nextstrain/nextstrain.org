import React from "react";
import Collapsible from "react-collapsible";
import _sortBy from "lodash/sortBy";
import {FaFile} from "react-icons/fa";
import { SmallSpacer, MediumSpacer, HugeSpacer, FlexCenter } from "../../layouts/generalComponents";
import * as splashStyles from "../splash/styles";
import CollapseTitle from "../Misc/collapse-title";
import {parseNcovSitRepInfo} from "../../../../auspice-client/customisations/languageSelector";

const charonGetAvailableAddress = process.env.NODE_ENV === "development" ?
  "http://localhost:5000/charon/getAvailable" :
  "/charon/getAvailable";

/**
 * A component to render all SARS-CoV-2 situation reports.
 * Data is obtained on page load by a API call to /charon/getAvailable.
 *
 * Note for testing: when using the garsby dev server (i.e. `npm run dev`)
 * the charon API is not available. In this case, the request will be made
 * to localhost:5000 which allows you to run the nextstrain.org server
 * as a separate process.
 */
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
    fetch(charonGetAvailableAddress)
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
      <>
        <HugeSpacer /><HugeSpacer />
        <splashStyles.H2 left>
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
      </>
    );
  }
}

export default Index;
