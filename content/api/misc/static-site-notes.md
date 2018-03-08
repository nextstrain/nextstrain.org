---
title: "static site notes"
author: "james hadfield"
chapter: "misc"
order: 1
date: "08/03/2018"
type: "api"
---

#### Config
`/data/SiteConfig.js` contains, amongst other things
  * site titles
  * chapter ordering
  * The data behind the virus tiles on the splash page

#### Global Styles
Styles are currently scattered everywhere, but the general aim is to consolidate these into:
  * `/src/layouts/index.jsx`
  * `/src/layouts/prism-styles.js` The CSS used for code highlighting
  * `/src/theme.js` Global colours etc. Injected into the props of every component (now quite sure how).
  * `/src/layouts/css/index.css` _move this to a glamor file_
