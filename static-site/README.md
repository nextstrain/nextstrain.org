<div align="center">
    <img src="static/logos/nextstrain_should_be_svg.png" alt="Logo" width='472px' height='100px'/>
</div>

<br/>

# Nextstrain static site
This directory contains the documentation files and static site generator for nextstrain.
For general `nextstrain.org` documentation including the nextstrain server (including the `/charon/...` API endpoints) and auspice customizations, see [nextstrain.org/README.md](../README.md).

The static-site is built using [Next.JS](https://nextjs.org/).
An understanding of Next.JS concepts will be generally helpful for understanding the different moving parts however this README will attempt to link to the salient documentation as needed.


## Installing & developing

There are no specific dependencies or software defined within `./static-site`, so all that's needed is to follow the [installation instructions in the parent directory's README](../README.md#build-nextstrainorg-locally).

> TL;DR: In the parent directory, run `node server.js` with your usual environment variables, or run `npm run dev` which will also watch for any changes to the server code. Both will serve the pages defined here using hot-reloading so that any changes are immediately reflected on localhost.

## Page-base routing

> See [our routing docs](https://docs.nextstrain.org/projects/nextstrain-dot-org/en/latest/routing.html) for a high level overview of the routing used in nextstrain.org

We use Next.JS' [App Router](https://nextjs.org/docs/app) to define routes based on filenames within `./static-site/app`.
The [Next.JS dynamic routing](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes) docs explain mapping between filenames and URL paths.

Currently these are the only Next.JS pages we serve. If the path doesn't exist in `./static-site/app` (and it's not handled elsewhere by the nextstrain.org server) then the default 404 page will be displayed.

### Routing conflicts

As alluded to in [our routing docs](https://docs.nextstrain.org/projects/nextstrain-dot-org/en/latest/routing.html) the presence of Next.JS routing + our own server routing can cause conflicts if not used appropriately.
We'll use an example here to demonstrate how such a conflict could occur:

We currently route requests for `/zika` to the auspice entrypoint.
If a Next.JS page `./static-site/app/zika/page.tsx` existed then requests to `/zika` would still go to Auspice, because that route takes priority in our nextstrain.org server route hierarchy.
However if we included a client-side `<Link href='/zika'>` component then via client-side routing you would be able to load the Next.JS Zika page. (Refreshing the page would go back to Auspice, as the browser would make a new request to `/zika`.)
Please don't do this!

## Pages are statically generated

In production mode all pages are statically generated at build time.
Pages may make API requests to the server for information, and the use of App Router and React Server Components means some things are rendered server-side.

In development mode the pages are dynamically served by the server to allow hot-reloading etc (this is the default situation if you don't specify `NODE_ENV=production` or `USE_PREBUILT_STATIC_SITE=1`)

### public directory

We use a `static-site/public` directory for assets which are exposed at the root (nextstrain.org) URL.
At the moment these largely consist of images used in blog posts.

# Adding content
* [See this page in the docs](https://nextstrain.org/docs/contributing/documentation)

### Adding new pathogen images for tiles
1. Navigate to the Auspice view and take a square screenshot of a panel that is representative of the data.
2. If using a tree, make sure branch labels are turned off.
3. Downsize the image to 250px by 250px.
4. Save the file in `./static/pathogen_images`
5. Add a new entry to [./content/featured-analyses.yaml](./content/featured-analyses.yaml).

### Adding new team members

To add a new team member to the [nextstrain.org/team](https://nextstrain.org/team) page, make a PR in this repo with the following changes:
1. Add an image for the team member to the [./static/team](./static/team) directory.
2. Add an entry for the team member to the [./components/people/teamMembers.ts](./components/people/teamMembers.ts) file in the appropriate list.
   Note that the lists are currently ordered by alphabetical order by the last names.

After the above PR is merged, the new team member can then be added to the [docs.nextstrain.org](https://docs.nextstrain.org) footer.
1. Make a PR in the [nextstrain/sphinx-theme](https://github.com/nextstrain/sphinx-theme) to update the custom [footer](https://github.com/nextstrain/sphinx-theme/blob/main/lib/nextstrain/sphinx/theme/footer.html) with the new team member.
2. Merge the PR and follow [instructions to release a new version of the theme on PyPI](https://github.com/nextstrain/sphinx-theme#releasing).
3. Once the new version is available on PyPI, trigger RTD rebuilds for the latest/stable doc versions to update the footer.

### Writing blog posts

To author a new blog post, create a new file under `/static-site/content/blog/` following the existing file naming convention (`YYYY-MM-DD-the-title-here.md`, e.g., `2024-11-14-blog-posts-are-awesome.md`). The file should start with a block of YAML front matter, such as:

``` yaml
---
author: "James Hadfield"
date: "2018-05-14"
title: "New nextstrain.org website"
sidebarTitle: "New Nextstrain Website"
---
```

followed by the content of the blog post, marked up using [Markdown](https://en.wikipedia.org/wiki/Markdown). Please observe the following conventions:

* Images associated with blog posts should be placed in [`/static-site/public/blog/img/`](./public/blog/img)
* All images associated with a given blog post should start with a common filename prefix, which should be clearly related to the blog post; see the existing files in the directory for examples
* Image URLs in the post should be given in an origin-relative format; i.e., they should start with `/blog/img/`
* Links to other pages and resources on `nextstrain.org` should also be given in origin-relative form; i.e., they should NOT start with `https://nextstraing.org`, only with a `/`

## Deploying
The static documentation is automatically rebuilt every time the (parent) repo is pushed to master.

## License and copyright

Copyright Trevor Bedford and Richard Neher.

Source code to Nextstrain is made available under the terms of the [GNU Affero General Public License 3.0](../LICENSE) (AGPL-3.0). Nextstrain is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
