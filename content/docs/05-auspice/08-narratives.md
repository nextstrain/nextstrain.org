---
title: "Narratives"
date: "2018-06-04"
---

> Narratives are a developmental feature not yet released.
> As such, there will be bugs and the API may change!
> Comments & suggestions are really helpful at this stage :)

Narratives are a forthcoming story-telling functionality of nextstrain.
They utilise authored markdown content to present a story which drives the state of the app.
Put another way, they allow authors to write a story (via a markdown file) which, as the user scrolls through, can change the state of the app -- e.g. what panels, filters, colours are displayed.


The scope for narratives is large - they could encompass static reports, summaries of papers, as well as continually maintained introductions to current outbreaks or datasets.


### Technical details
* Narrative markdown files are located in the static github repo in the `narratives` directory.
* They are accessed via nextstrain.org/narratives/X where X is the filepath of the narratives markdown without the `.md` suffix.
* See [this example markdown](https://github.com/nextstrain/static/blob/master/narratives/test.md) which can be accessed at [www.nextstrain.org/narratives/test](https://www.nextstrain.org/narratives/test)
* There is a short YAML header and a code block defining the URL state the app should be in for the following paragraph.

> Currently dataset changes & 2nd trees are not implemented, and the interface is slow
