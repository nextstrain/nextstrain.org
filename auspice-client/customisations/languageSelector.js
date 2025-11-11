import React from "react";
import ISO6391 from "iso-639-1/build/index";

/* This and some of the following functions are reused
in the static site (specifically ../../static-site/src/pages/ncov-sit-reps.jsx)
via parseNcovSitRepInfo (exported below) so changing them will affect behavior there.
This one in particular is duplicated from ../../src/utils
(aka src/utils from top level repo) but included here to:
(a) keep server & client code seperate
(b) avoid any transpiling errors during client building */
const parseNarrativeLanguage = (narrativeUrl) => {
  const urlParts = narrativeUrl.split("/");
  let language = urlParts[urlParts.length - 2];
  if (language === 'sit-rep') language = 'en';
  return language;
};

// Indirectly used in static site, see above comment in parseNarrativeLanguage.
const getNarrativeLanguageNativeName = (narrativeUrl) => {
  const narrativeLanguage = parseNarrativeLanguage(narrativeUrl);
  const nativeName = ISO6391.getNativeName(narrativeLanguage);
  if (nativeName === "") {
    console.warn("language code: ", narrativeLanguage, "not found in ISO standard. Using language code instead of native name.");
    return narrativeLanguage;
  }
  return nativeName;
};

// Indirectly used in static site, see above comment in parseNarrativeLanguage.
// This is simple but happens in too many places to not abstract.
const getSitRepDate = (url) => url.split('/').pop();

// Used in static site, see comment above in parseNarrativeLanguage.
export const parseNcovSitRepInfo = (url) => {
  if (!url.startsWith('narratives/ncov/sit-rep/')) return null;
  try {
    return {
      url,
      date: getSitRepDate(url),
      languageCode: parseNarrativeLanguage(url),
      languageNative: getNarrativeLanguageNativeName(url)
    };
  } catch (err) {
    throw new Error("Unforseen narrative url", url, "caused error:", err);
  }
};

class LanguageSelector extends React.Component {
    state = {
      currentNarrative: undefined,
      availableNarratives: undefined
    }

    async getAvailableNarratives() {
      const response = await fetch("/charon/getAvailable");
      const available = await response.json();
      return available.narratives.map((n) => n.request);
    }

    async componentDidMount() {
      const currentNarrative = window.location.pathname.replace(/^\//, '');
      const currentNarrativeDate = getSitRepDate(currentNarrative);
      this.getAvailableNarratives().then((availableNarratives) => {
        const translatedNarratives = [];
        availableNarratives.map(parseNcovSitRepInfo)
        .filter((o) => o !== null)
        .forEach(sitrep => {
          // Insert 'en' into narrative url to force English version of narrative
          // if user has a separate language preference
          if (sitrep.languageCode === "en") {
            const narrativeParts = sitrep.url.split('/');
            narrativeParts.splice(-1, 0, 'en');
            sitrep.url = narrativeParts.join('/');
          }
          if (sitrep.date === currentNarrativeDate) {
            translatedNarratives.push(sitrep);
          }
        });
        this.setState({
          currentNarrative: currentNarrative,
          availableNarratives: translatedNarratives
        });
      }).catch((error) => {
        console.log(error);
      });
    }

    handleLanguageChange(event) {
      const narrativeUrl = event.target.value;
      window.location.assign(window.location.origin + '/' + narrativeUrl + window.location.search);
    }

    render() {
      if (this.state.availableNarratives && this.state.currentNarrative) {
        return (
          <select value={this.state.currentNarrative} onChange={this.handleLanguageChange}>
            {this.state.availableNarratives.map((narrative) => {
              return (
                <option key={narrative.url} value={narrative.url}>
                  {narrative.languageNative}
                </option>
              );
            })}
          </select>
        );
      }
      return null;
    }
}

export default LanguageSelector;
