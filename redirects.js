

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

};

module.exports = {
  setup
};
