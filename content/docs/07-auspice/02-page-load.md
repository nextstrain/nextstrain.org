---
author: "james hadfield"
date: "01/01/2017"
title: "Auspice page load code flow"

---

* How are query params (`?c=country...`) read on page load?
They remain untouched in the URL and `loadJSONs` reads them and passes them to the controls reducer along with the JSON data


* How are query params read during interaction with the app?
They're not - actions are dispatched to change state and middleware keeps the URL up to date


* How is the desired dataset (e.g. zika, flu/...) loaded?
The `changePage` action (perhaps via `popstate`) sets this as redux state (`datasets.datapath`), which is used by the `loadJSONs` action (including triggering the narrative markdown fetch)


* What is the order of actions on initial page load?
    * The initial page is set in the default state of the `datasets` reducer by examining the URL (so no `popstate` action on load). If this is `<App>` then the app loads with a spinning nextstrain logo as we don't yet have any data. Similarly, the `<splash>` page will load with a spinning logo where the tiles should be, as this information requires the manifest JSON.
    * The manifest JSON is fetched (`<Monitor>` -> `componentDidMount` -> `getManifest`)
    * The arrival of this JSON triggers `MANIFEST_RECEIVED` and `changePage` actions
    * The `changePage` does nothing here (the reducer state is already correct) unless `page === "app"` where it sets `datasets.datapath` (previously `undefined`)
    * If we're on `<App>`, the lifecycle methods detect a change in `datasets.datapath` and trigger the `loadJSONs` action

* NB: current URL state _is_ stored in the `datasets` reducer, but this is only used upon back/forward navigation logic - this is desired because I want to be able to use the back/forward buttons and _not_ reload the entire app (like we did before).

* Where is URL state _read_?
    * googleAnalytics
    * `loadJSONs` - query state is passed to the reducers at the same time as the JSONs, which allows the correct state to be set.
    * footer - the acknowledgements are hard coded and are selected via the URL (could be via `datasets.datapath` or set in the JSONs)
    * the `browserBackForward` action, triggered from a `popstate` listener in `<Monitor>`. Used to `changePage` or `changePageQuery` when the URL changes via back/forward buttons. Note that this is the only place that uses the `state.datasets.urlX` values (necessary for comparison of old URL vs new URL).
    * initial state of `state.datasets` (i.e. does the splash page load, or the app, or...). This could be achieved via an initial `changePage` action, but we aim to minimize actions...
    * `getManifest` uses the pagename to load the appropriate data (see above) - this could potentially be improved.
