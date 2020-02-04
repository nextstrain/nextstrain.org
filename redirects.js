const helpers = require("./auspice/server/getDatasetHelpers");

const setup = (app) => {

  /* send auspice to the auspice docs (currently hosted as github pages) */
  app.route("/auspice")
    .get((req, res) => res.redirect('https://nextstrain.github.io/auspice/'));

  /* we don't yet have a community page */
  app.route("/community")
    .get((req, res) => res.redirect('/#community'));

  /* we don't yet have a narratives page. Send /narratives to the narratives section of the frontpage */
  app.route("/narratives")
    .get((req, res) => res.redirect('/#narratives'));

  /* The URLs and nextstrain.org/narratives/ncov and nextstrain.org/narratives/ncov/sit-rep
  aren't valid - redirect instead to the nCoV section of the splash page */
  app.route(["/narratives/ncov", "/narratives/ncov/sit-rep"])
    .get((req, res) => res.redirect('/#ncov'));

  /*
   * Redirect to translations of narratives if the client has
   * set language preference and the translation is available
   *
   * Currently only used for nCoV narratives and requires the
   * language code to be the second to last part of the url.
   */
  app.route("/narratives/ncov/sit-rep/*")
    .get(async (req, res, next) => {
      const {source, prefixParts} = helpers.splitPrefixIntoParts(req.url);
      const availableNarratives = await source.availableNarratives();
      const availableLanguages = new Set(availableNarratives
        .filter((narrative) => narrative.startsWith('ncov/sit-rep/'))
        .map((narrative) => {
          const narrativeParts = narrative.split("/");
          let language = narrativeParts[narrativeParts.length - 2];
          if (language === 'sit-rep') language = 'en';
          return language;
        }));
      const languageChoice = req.acceptsLanguages([...availableLanguages]);
      if (languageChoice && languageChoice !== 'en') {
        prefixParts.splice(-1, 0, languageChoice);
        const potentialNarrative = prefixParts.join("/");
        if (availableNarratives.includes(potentialNarrative)) {
          return res.redirect(302, "/narratives/" + potentialNarrative);
        }
      }
      return next('route');
    });

};

module.exports = {
  setup
};
