---
title: "static site notes"
author: "james hadfield"
chapter: "misc"
order: 1
date: "08/03/2018"
type: "api"
---

### Config
`/data/SiteConfig.js` contains, amongst other things
  * site titles
  * chapter ordering
  * The data behind the virus tiles on the splash page

### Global Styles
Styles are currently scattered everywhere, but the general aim is to consolidate these into:
  * `/src/layouts/index.jsx`
  * `/src/layouts/prism-styles.js` The CSS used for code highlighting
  * `/src/theme.js` Global colours etc. Injected into the props of every component (now quite sure how).
  * `/src/layouts/css/index.css` _move this to a glamor file_
Other styles, specific to certain sections, e.g. the sidebar, the splash page, the navigation header, should be defined via `styled-components` in those directories.


### Slugs, Markdown, GraphQL...

Markdown files in `/content` are collated via the `MarkdownRemark` gatsby plugin. These can be accessed by a GraphQL query (e.g. in `gatsby-node.js`, `/templates/generic.jsx`). `createPages` in `gatsby-node.js` determines the component (template) which is loaded for each file, while `onCreateNode` modifies the slug (path) - i.e. this sets the appropriate URLs for each page.

### Sidebar
* `/src/components/Sidebar/index.jsx`
* uses the chapter ordering in the config file to sort things, and then the frontmatter `order` number to sort within each chapter.

### Header
* `/src/components/Header/index.jsx`
