import React from "react";
import Helmet from "react-helmet";
import Collapsible from "react-collapsible";
import _sortBy from "lodash/sortBy";
import _cloneDeep from "lodash/cloneDeep";
import FaFile from "react-icons/lib/fa/file";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import { SmallSpacer, MediumSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import Footer from "../components/Footer";
import CollapseTitle from "../components/Misc/collapse-title";

const translatedLanguages = {
  ar: {
    name: "Arabic",
    nativeName: "العربية"
  },
  bn: {
    name: "Bengali",
    nativeName: "বাংলা"
  },
  cs: {
    name: "Czech",
    nativeName: "česky, čeština"
  },
  de: {
    name: "German",
    nativeName: "Deutsch"
  },
  el: {
    name: "Greek, Modern",
    nativeName: "Ελληνικά"
  },
  en: {
    name: "English",
    nativeName: "English"
  },
  es: {
    name: "Spanish; Castilian",
    nativeName: "español, castellano"
  },
  fa: {
    name: "Persian",
    nativeName: "فارسی"
  },
  fr: {
    name: "French",
    nativeName: "français, langue française"
  },
  hi: {
    name: "Hindi",
    nativeName: "हिन्दी, हिंदी"
  },
  id: {
    name: "Indonesian",
    nativeName: "Bahasa Indonesia"
  },
  it: {
    name: "Italian",
    nativeName: "Italiano"
  },
  ja: {
    name: "Japanese",
    nativeName: "日本語 (にほんご／にっぽんご)"
  },
  ko: {
    name: "Korean",
    nativeName: "한국어 (韓國語), 조선말 (朝鮮語)"
  },
  nl: {
    name: "Dutch",
    nativeName: "Nederlands, Vlaams"
  },
  pl: {
    name: "Polish",
    nativeName: "polski"
  },
  "pt-br": {
    name: "Brazilian Portuguese",
    nativeName: "Português do Brasil"
  },
  pt: {
    name: "Portuguese",
    nativeName: "Português"
  },
  ru: {
    name: "Russian",
    nativeName: "русский язык"
  },
  sw: {
    name: "Swahili",
    nativeName: "Kiswahili"
  },
  tl: {
    name: "Tagalog",
    nativeName: "Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔"
  },
  tr: {
    name: "Turkish",
    nativeName: "Türkçe"
  },
  ur: {
    name: "Urdu",
    nativeName: "اردو"
  },
  vi: {
    name: "Vietnamese",
    nativeName: "Tiếng Việt"
  },
  zh: {
    name: "Chinese",
    nativeName: "中文 (Zhōngwén), 汉语, 漢語"
  }
};

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
    this.handleError = this.handleServerError.bind(this);
    this.sitRepCards = this.getNarrativesByLanguageObject.bind(this);
    this.translatedLanguages = _cloneDeep(translatedLanguages);
  }

  getNarrativesByLanguageObject(json) {
    const narrativesByLanguage = this.translatedLanguages;
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
            sitrep.language = parts[0].toLowerCase();
            sitrep.title = parts[1];
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
        if (!narrativesByLanguage[sitrep.language]) {
          // define a language just using the 2 letter code if none exists in our dictionary
          narrativesByLanguage[sitrep.language] = {
            name: sitrep.language,
            nativeName: sitrep.language
          };
        }
        // add sitreps to the language object
        if (narrativesByLanguage[sitrep.language].narratives) narrativesByLanguage[sitrep.language].narratives.push(sitrep);
        else narrativesByLanguage[sitrep.language].narratives = [sitrep];
      });
    // get all the languages for which we have at least one narrative
    const languageObjects = Object.entries(narrativesByLanguage)
                                  .map((l) => Object.assign({}, l[1], {code: l[0]}))
                                  .filter(language => language.narratives !== undefined && language.narratives.length > 0);
    // sort most recent dates first
    languageObjects.forEach((l) => {
      l.narratives.sort().reverse();
    });
    // English first then by language code
    return _sortBy(languageObjects, [(o) => o.name !== "English", (o) => o.code]);
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
        this.setState({ hasError: true });
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
                      <div key={language.name}>
                        <Collapsible
                          triggerWhenOpen={<CollapseTitle name={language.nativeName} isExpanded />}
                          trigger={<CollapseTitle name={language.nativeName} />}
                          triggerStyle={{cursor: "pointer", textDecoration: "none"}}
                          open={language.name === "English"} // start with English open. Later we can take this from browser settings using Jover's code?
                        >
                          {/* Begin collapsible content */}
                          <div className="row">
                            {Array.from(language.narratives.entries()).map(([index, narrative]) => (
                              <div className="col-sm-4">
                                <FlexCenter>
                                  <a href={narrative.url}>
                                    <splashStyles.SitRepTitle attn={index === 0}>
                                      <FaFile />
                                      {" "+narrative.title}
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
