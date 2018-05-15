---
title: "Nextstrain.org website introduction"
date: "2018-04-30"
---

The nextstrain.org website (excluding the interactive app) is built using [Gatsby](https://www.gatsbyjs.org/).
All file are located on [GitHub](https://github.com/nextstrain/static) and deployed on a Heroku server.
Editing the live site is achieved via a PR to the GitHub repo, any commits to `master` branch are pushed live automatically via Travis CI.

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
The URLs for these are created in the `createPages` function in `/gatsby-node.js`, and simply define a react component to be rendered, usually in `/src/components`.
This means you have complete control over the styling and content for these pages, but they are not as simple to write as a markdown file.

## Styling

> The styling needs to be refined and centralized. Currently, the tooling is there, but there is no coherent definition of padding, colours etc.

This site uses a mix of (some) css files and (mostly) [styled-components](https://www.styled-components.com/).
There is a theme (`src/layouts/theme`) which is available for every styled-component via `${props=>props.theme.X}`.
This theme should hold most of the colours, paddings etc so that the site is coherent.

#### Global-like CSS & styled-components

* `layouts/globals.css` contains a very small amount of globally defined CSS on the `html` and `*` elements
* `layouts/browserCompatability.css` should only contain CSS for older browsers
* `layouts/bootstrap.css` contains bootstrap grid CSS
* `layouts/prism.css` contains the CSS used for code highlighting (along with the gatsby-prism-plugin)
* `layouts/index.jsx` wraps all content in `GlobalStyles` which contains some globally inherited values

#### Styled-components

Styled-components may be defined within templates / pages if their scope is limited.
`/layouts/generalComponents` exposes some more general components which multiple views take in.


## Gatsby details

**How are markdown files turned into pages?**
Markdown files in `/content` are collated via the `MarkdownRemark` gatsby plugin. These can be accessed by a GraphQL query (e.g. in `gatsby-node.js`, `/templates/generic.jsx`). `createPages` in `gatsby-node.js` determines the component (template) which is loaded for each file, while `onCreateNode` modifies the slug (path) - i.e. this sets the appropriate URLs for each page.


**What changes need to be made when adding to /content?**
If it's simply the addition of a new markdown file or a new folder within an existing category (e.g. adding a chapter to `/content/docs`) then nothing further should be needed. The top-level folders in `/content` are hardcoded as entries in the header, so you should change both in tandem.
