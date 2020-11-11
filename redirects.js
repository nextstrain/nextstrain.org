const helpers = require("./src/getDatasetHelpers");
const { parseNarrativeLanguage } = require("./src/utils");

const setup = (app) => {

  /* send auspice to the auspice docs (currently hosted on docs.nextstrain.org) */
  app.route("/auspice")
    .get((req, res) => res.redirect('https://docs.nextstrain.org/projects/auspice/en/migrate-docs/'));

  /* we don't yet have a community page */
  app.route("/community")
    .get((req, res) => res.redirect('/#community'));

  /* we don't yet have a narratives page. Send /narratives to the narratives section of the frontpage */
  app.route("/narratives")
    .get((req, res) => res.redirect('/#narratives'));

  /* The URLs and nextstrain.org/narratives/ncov and nextstrain.org/narratives/ncov/sit-rep
  aren't valid - redirect instead to the sit-reps section of the nCoV splash page */
  app.route(["/narratives/ncov", "/narratives/ncov/sit-rep", "/ncov-sit-reps"])
    .get((req, res) => res.redirect('/sars-cov-2#sit-reps'));

  app.route(["/ncov"])
    .get((req, res) => res.redirect('/sars-cov-2'));

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
        .map((narrative) => parseNarrativeLanguage(narrative)));
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

  /* We redirect /ncov/zh -> /ncov/global/zh here rather than the manifest file as the URL structure currently
  conflates a language part ("zh") with a region ("europe") so we want to keep zh out of the manifest JSON */
  app.route("/ncov/zh").get((req, res) => res.redirect("/ncov/global/zh"));

  // DOCS, HELP Redirects for docs migration:
  const mainReadTheDocs = "https://docs.nextstrain.org/en/latest";
  const augurReadTheDocs = "https://docs.nextstrain.org/projects/augur/en/migrate-docs";

  const docsRedirects = {
    "/docs": `${mainReadTheDocs}`,
    "/help": `${mainReadTheDocs}/learn/about-nextstrain.html`,
    "/docs/getting-started/introduction": `${mainReadTheDocs}/learn/about-nextstrain.html`,
    "/about": `${mainReadTheDocs}/learn/about-nextstrain.html`,
    "/about/overview/introduction": `${mainReadTheDocs}/learn/about-nextstrain.html`,
    "/about/overview": `${mainReadTheDocs}/learn/about-nextstrain.html`,
    "/about/methods/introduction": `${mainReadTheDocs}/learn/about-nextstrain.html`,
    "/about/methods": `${mainReadTheDocs}/learn/about-nextstrain.html`,
    "/docs/getting-started/local-installation": `${mainReadTheDocs}/guides/install/local-installation.html`,
    "/docs/getting-started/installation": `${mainReadTheDocs}/guides/install/local-installation.html`,
    "/docs/getting-started/local-vs-container-install": `${mainReadTheDocs}/guides/install/index.html`,
    "/docs/getting-started/container-installation": `${mainReadTheDocs}/guides/install/cli-install.html`,
    "/docs/getting-started/quickstart": `${mainReadTheDocs}/tutorials/quickstart.html`,
    "/docs/getting-started/windows-help": `${mainReadTheDocs}/guides/install/windows-help.html`,
    "/docs/bioinformatics/introduction-to-augur": `${augurReadTheDocs}/faq/introduction-to-augur.html`,
    "/docs/bioinformatics/introduction": `${augurReadTheDocs}/faq/introduction-to-augur.html`,
    "/docs/bioinformatics/what-is-a-build": `${augurReadTheDocs}/faq/what-is-a-build.html`,
    "/docs/bioinformatics/data-formats": `${mainReadTheDocs}/reference/formats/data-formats.html`,
    "/docs/bioinformatics/output-jsons": `${mainReadTheDocs}/reference/formats/data-formats.html`,
    "/docs/bioinformatics/augur-commands": `${augurReadTheDocs}/usage/cli/cli.html`,
    "/docs/bioinformatics/customizing-a-build": `${mainReadTheDocs}/guides/bioinformatics/index.html`,
    "/docs/tutorials/defining-clades": `${mainReadTheDocs}/guides/bioinformatics/defining-clades.html`,
    "/docs/tutorials/zika": `${mainReadTheDocs}/tutorials/zika.html`,
    "/docs/getting-started/zika-tutorial": `${mainReadTheDocs}/tutorials/zika.html`,
    "/docs/tutorials/tb": `${mainReadTheDocs}/tutorials/tb_tutorial.html`,
    "/docs/getting-started/tb-tutorial": `${mainReadTheDocs}/tutorials/tb_tutorial.html`,
    "/docs/contributing/community-builds": `${mainReadTheDocs}/guides/share/community-builds.html`,
    "/docs/contributing/documentation": `${mainReadTheDocs}/guides/contribute/documentation.html`,
    "/docs/contributing/development": `${mainReadTheDocs}/guides/contribute/index.html`,
    "/docs/contributing/fetch-data-from-custom-urls": `${mainReadTheDocs}/guides/share/fetch-via-urls.html`,
    "/fetch": `${mainReadTheDocs}/guides/share/fetch-via-urls.html`,
    "/docs/contributing/nextstrain-groups": `${mainReadTheDocs}/guides/share/nextstrain-groups.html`,
    "/docs/contributing/sharing-data": `${mainReadTheDocs}/guides/share/index.html`,
    "/docs/contributing/philosophy": `${mainReadTheDocs}/guides/share/index.html`,
    "/docs/visualisation/download-data": `${mainReadTheDocs}/guides/share/download-data.html`,
    "/docs/visualisation/map-interpretation": `${mainReadTheDocs}/learn/interpret/map-interpretation.html`,
    "/docs/visualisation/narratives": `${mainReadTheDocs}/guides/communicate/narratives-intro.html`,
    "/docs/narratives/introduction": `${mainReadTheDocs}/guides/communicate/narratives-intro.html`,
    "/help/general/about-nextstrain": `${mainReadTheDocs}/learn/about-nextstrain.html`,
    "/help/general/how-to-read-a-tree": `${mainReadTheDocs}/learn/interpret/how-to-read-a-tree.html`,
    "/help/general/interacting-with-nextstrain": `${mainReadTheDocs}/learn/interpret/interacting-with-nextstrain.html`,
    "/docs/interpretation": `${mainReadTheDocs}/learn/interpret/index.html`,
    "/docs/interpretation/auspice": `${mainReadTheDocs}/learn/interpret/index.html`,
    "/docs/visualisation": `${mainReadTheDocs}/learn/interpret/index.html`,
    "/docs/visualisation/introduction": `${mainReadTheDocs}/learn/interpret/index.html`,
    "/help/coronavirus/FAQ": `${mainReadTheDocs}/learn/pathogens/coronavirus/FAQ.html`,
    "/help/coronavirus/SARS-CoV-2": `${mainReadTheDocs}/learn/pathogens/coronavirus/SARS-CoV-2.html`,
    "/help/coronavirus/Technical-FAQ": `${mainReadTheDocs}/learn/pathogens/coronavirus/Technical-FAQ.html`,
    "/help/coronavirus/human-CoV": `${mainReadTheDocs}/learn/pathogens/coronavirus/human-CoV.html`
  };

  for (const [from, to] of Object.entries(docsRedirects)) {
    app.route([from])
    .get((req, res) => res.redirect(to));
  }

};

module.exports = {
  setup
};
