---
title: "narrative markdown description"
chapter: "auspice"
lesson: 10
order: 8
cover: "https://unsplash.it/400/300/?random?BoldMage"
date: "01/01/2017"
category: "tech"
type: "docs"
tags:
    - programming
    - stuff
    - other
---

The content of a narrative is written in markdown is stored on github.com/nextstrain/themis. A line such as [NEXTSTRAIN_URL](ebola?dmax=2014-03-20&dmin=2014-01-01) specifies that the subsequent content should trigger the app to change state to reflect that URL query. The server fetches this file and parses it a JS object with blocks of HTML (via ReactDOMServer.renderToStaticMarkup) and a corresponding URL. This is sent to the client where it is set as the state of the Narrative component
