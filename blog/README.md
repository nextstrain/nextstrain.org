# Nextstrain.org blog

The nextstrain.org blog is built using `gazette`, a separate tool which turns custom markdown documents into standalone statically-servable HTML pages with the ability to have custom interactive figures.
We post-process these HTML pages to add our typical nextstrain.org header / footer elements to them, and the resulting page is served by our express server.


## Creating a new blogpost / developing a new blogpost:

#### Initialise a new blogpost

TKTK

#### Edit (with live reloading) a blogpost

TKTK

#### How to use interactive figures

TKTK


## How is the blog constructed?

We use `gazette`

## Steps to building the blogposts for the live site:

> These steps are run by our main `build.sh` pipeline

1. `npm run build:gazette` uses `gazette` to render interactive HTML versions of the blogposts
2. `npm run snapshot:chrome` renders a (hidden) next.js page with the header & footer and snapshots the HTML & CSS
3. `npm run build:static-blog` combines the gazette HTML pages with the header & footer elements to produce the final blog posts
4. `npm run build:feeds` to build RSS feeds of the blog

