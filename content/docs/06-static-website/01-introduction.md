---
author: "James Hadfield"
date: "30/04/2018"
title: "Nextstrain.org website introduction"
---

The nextstrain.org website (excluding the interactive app) is build using [gatsby](https://www.gatsbyjs.org/).
All file are located on [github](https://github.com/nextstrain/nextstrain.org) and deployed on a heroku server.
Editing the live site is achieved via a PR to the github repo (it also needs to be pushed to heroku, which one day could be done automatically).

## Installation

## Website content
In general, the content is sourced in two ways: markdown-derived pages and statically coded pages.

### Dynamically constructed markdown pages (a.k.a. content)
This is the majority of the website, consisting of the blog, documentation, methods and reports pages.
The files are automatically sourced from the `/content` directory, with each file accessed by it's own URL (see below).
The markdown content is parsed into HTML and handed to `/templates/generic.jsx` to be rendered.
The URL is constructed using the markdown file pathname via the function `onCreateNode` (in `/gatsby-node.js`).
For instance, this page is generated from [this markdown file](https://github.com/nextstrain/nextstrain.org/blob/master/content/docs/06-static-website/introduction.md).
See [this page](./writing-content.md) for more detailed instructions regarding the markdown format.


### Statically defined pages
These include the splash page, about page, flu page etc.
The URLs for these are created in the `createPages` function in `/gatsby-node.js`, and simply define a react component to be rendered, usually in `/src/pages`.
This means you have complete control over the styling and content for these pages, but they are not as simple to write as a markdown file.

## Styling
Styles are currently scattered everywhere, but the general aim is to consolidate these into:
  * `/src/layouts/index.jsx`
  * `/src/layouts/prism-styles.js` The CSS used for code highlighting
  * `/src/theme.js` Global colours etc. Injected into the props of every component (now quite sure how).
  * `/src/layouts/css/index.css` _move this to a glamor file_
Other styles, specific to certain sections, e.g. the sidebar, the splash page, the navigation header, should be defined via `styled-components` in those directories.

## Gatsby details

**How are markdown files turned into pages?**
Markdown files in `/content` are collated via the `MarkdownRemark` gatsby plugin. These can be accessed by a GraphQL query (e.g. in `gatsby-node.js`, `/templates/generic.jsx`). `createPages` in `gatsby-node.js` determines the component (template) which is loaded for each file, while `onCreateNode` modifies the slug (path) - i.e. this sets the appropriate URLs for each page.


**What changes need to be made when adding to /content?**
If it's simply the addition of a new markdown file or a new folder within an existing category (e.g. adding a chapter to `/content/docs`) then nothing further should be needed. The top-level folders in `/content` are hardcoded as entries in the header, so you should change both in tandem.
