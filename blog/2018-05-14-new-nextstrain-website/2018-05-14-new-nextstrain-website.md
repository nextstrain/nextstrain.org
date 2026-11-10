---
author: "James Hadfield"
date: "2018-05-14"
title: "New nextstrain.org website"
sidebarTitle: "New Nextstrain Website"
---

The data visualisation aspect of nextstrain.org has been under a lot of development over the last year, with new features and new datasets, but we've fallen behind with documentation and explanations of everything that's going on.
We've now expanded Nextstrain to include pages explaining the ideas behind the project, documentation of features and code, as well as the ability to write blogposts such as this one.
Content's still being added, and soon we'll have some tutorials to help people understand and use the data visualisations at the core of Nextstrain.


## Technical details
Nextstrain.org is built from [this repo](https://github.com/nextstrain/nextstrain.org) using Heroku.
It's really only a simply node server which, upon deployment, fetches built versions of auspice and the static site.
The only complicated aspect is deciding whether to serve auspice or Gatsby files for a given request.


**The static site:** can be found [here](https://github.com/nextstrain/static) and is build using [Gatsby](https://www.gatsbyjs.org/).
This comprises the splash page and documentation (docs, about, blogs etc) all build from markdown files.
[This page](https://github.com/nextstrain/nextstrain.org/tree/master/static-site#nextstrain-static-site) explains the structure of the static page and shows how to add content – it's really easy ;).


**Auspice:** is the visualisation app, build as a single page javascript application ([github](https://github.com/nextstrain/auspice)).
This is what used to be nextstrain.org, but is now only used to visualise datasets (e.g. [nextstrain.org/WNV](/WNV)).
Removing the splash & about pages from auspice allows for easier development of auspice, and makes adding static content a matter of writing markdown rather than modifying the JavaScript of auspice.


**Deploying:** All three repos use travis CI, which checks to see if code pushed to GitHub can be successfully built,
so you can see the build statuses for [nextstrain.org](https://travis-ci.com/nextstrain/nextstrain.org), [the static code](https://travis-ci.com/nextstrain/static) and [auspice](https://travis-ci.com/nextstrain/auspice).
When certain branches (`master` for the static site, `release` for auspice) successfully pass Travis CI, Heroku is notified and rebuilds itself using the latest versions.
This means that to update the static site, for instance if you've added some markdown content or a blog post like this one, all that's needed is to push to `master` (or submit a PR and have it merged into `master`) and the entire website will be updated!
