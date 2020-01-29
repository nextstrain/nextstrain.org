

const setup = (app) => {

  /* send auspice to the auspice docs (currently hosted as github pages) */
  app.route("/auspice")
    .get((req, res) => res.redirect('https://nextstrain.github.io/auspice/'));

  /* we don't yet have a narratives page. Send /narratives to the narratives section of the frontpage */
  app.route("/narratives")
    .get((req, res) => res.redirect('/#narratives'));

};

module.exports = {
  setup
};
