import url from 'url';
import { match, compile } from "path-to-regexp";
import { splitPrefixIntoParts } from './utils/prefix.js';
import { parseNarrativeLanguage } from './utils/index.js';

const setup = (app) => {

  /* send auspice to the auspice docs (currently hosted on docs.nextstrain.org) */
  app.route("/auspice")
    .get((req, res) => res.redirect('https://docs.nextstrain.org/projects/auspice/en/latest/'));

  /* we don't yet have a narratives page. Send /narratives to the narratives section of the frontpage */
  app.route("/narratives")
    .get((req, res) => res.redirect('/#narratives'));

  /* The URLs and nextstrain.org/narratives/ncov and nextstrain.org/narratives/ncov/sit-rep
  aren't valid - redirect instead to the sit-reps section of the nCoV splash page */
  app.route(["/narratives/ncov", "/narratives/ncov/sit-rep", "/ncov-sit-reps"])
    .get((req, res) => res.redirect('/sars-cov-2#sit-reps'));

  /* handle redirects for inrb-drc (first of the Nextstrain groups) */
  app.get("/inrb-drc*", (req, res) => {
    res.redirect(`/groups${req.originalUrl}`);
  });

  /* We experimented with an /influenza page (motivated by the /sars-cov-2 page) but ultimately
  it remained a stub. Redirect to the (core) /pathogens page */
  app.route("/influenza")
    .get((req, res) => res.redirect('/pathogens'));

  /* handle redirects for dataset paths which have changed name & preserve any queries */
  /* We do route matching within `updateDatasetUrl`, so just capture all routes */
  app.route("/*").get((req, res, next) => {
    const urlPath = url.parse(req.url).pathname;
    const newUrlPath = updateDatasetUrl(urlPath);
    if (newUrlPath !== urlPath) {
      return res.redirect(url.format({pathname: newUrlPath, query: req.query}))
    }
    return next('route')
  });

  /*
   * Redirect to translations of narratives if the client has
   * set language preference and the translation is available
   *
   * Currently only used for nCoV narratives and requires the
   * language code to be the second to last part of the url.
   */
  app.routeAsync("/narratives/ncov/sit-rep/*")
    .getAsync(async (req, res, next) => {
      const {source, prefixParts} = splitPrefixIntoParts(req.url);
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

  /**
   * DOCS & HELP Redirects
   * In November 2020 we shifted the docs from being hosted by this server
   * at nextstrain.org/docs and nextstrain.org/help
   * to a Read The Docs setup running at docs.nextstrain.org.
   * This block contains the appropriate redirects
   */
  const mainReadTheDocs = "https://docs.nextstrain.org/en/latest";
  const augurReadTheDocs = "https://docs.nextstrain.org/projects/augur/en/stable";
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
    "/docs/bioinformatics/introduction-to-augur": `${augurReadTheDocs}/index.html`,
    "/docs/bioinformatics/introduction": `${augurReadTheDocs}/faq/index.html`,
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
    "/help/coronavirus/human-CoV": `${mainReadTheDocs}/learn/pathogens/coronavirus/human-CoV.html`,
    "/workshop": "https://github.com/nextstrain/nextstrain-walkthrough"
  };

  for (const [from, to] of Object.entries(docsRedirects)) {
    app.route([from])
      .get((req, res) => res.redirect(to));
  }

};

// Optional versioned dataset pattern for all redirect patterns
const versionDatasetPattern = ":version(@.*)?"

/** A list of original patterns with matching redirect patterns
 * that are used to create a list of match functions for transforming paths
 * into parameters and compile functions for transforming parameters into a valid path
 * intended to be used in `updateDatasetUrl`.
 *
 * Order matters as `updateDatasetUrl` returns the first matching pattern,
 * so list more specific patterns first.
 *
 * The original and redirect patterns MUST share the same params
 */
const datasetRedirectPatterns = [
  /** prior to June 2021 our core nCoV builds were available at
   * /ncov/global, ncov/asia etc. These used GISAID data exclusively.
   * We now have GISAID builds and GenBank builds, and so the URLs
   * (i.e. names on s3://nextstrain-data) have changed. We add redirects
   * for the old URLs to point to the new GISAID URLs.
   * The timestamped URLs (e.g. /ncov/:region/YYYY-MM-DD) which currently exist
   * will not be redirected, but new URLs will be of the format
   * /ncov/gisaid/:region/YYYY-MM-DD.
   */
  ['/ncov/:region(global|asia|oceania|north-america|south-america|europe|africa)', '/ncov/gisaid/:region'],
  /**
   * We shifted from using 'monkeypox' to 'mpox', as per WHO naming
   * recommendations. Note that monkeypox YYYY-MM-DD URLs remain,
   * e.g. /monkeypox/hmpxv1/2022-09-04
   */
  ['/monkeypox/mpxv', '/mpox/all-clades'],
  ['/monkeypox/hmpxv1', '/mpox/clade-IIb'],
  ['/monkeypox/hmpxv1/big', '/mpox/lineage-B.1'],
  ["/monkeypox", "/mpox"],

   /**
     * We shifted avian-flu and seasonal-flu to top level to stop nesting them
     * both under flu/ so that avian-flu is more discoverable
     */
   ['/flu/avian(.*)', '/avian-flu(.*)'],
   ['/flu/seasonal(.*)', '/seasonal-flu(.*)'],

   /**
    * Redirect /flu URL itself. We choose seasonal-flu to mimic historical behaviour
    */
   ['/flu', '/seasonal-flu'],

].map(([originalPattern, redirectPattern]) => [
  match(`${originalPattern}${versionDatasetPattern}`),
  compile(`${redirectPattern}${versionDatasetPattern}`)
]);

/**
 * Checks if the provided URL pathname matches are any of our datasetRedirectPatterns
 * If the there is match, then return the new URL for the dataset.
 * If there is no match, then return the original URL pathname.
 *
 * @param {string} originalUrlPathname
 * @returns {string}
 */
function updateDatasetUrl(originalUrlPathname) {
  for (const [urlMatch, toPath] of datasetRedirectPatterns) {
    const matchingURL = urlMatch(originalUrlPathname)
    if (matchingURL) {
      return toPath({...matchingURL.params})
    }
  }
  return originalUrlPathname
}

export {
  setup,
  updateDatasetUrl,
};
