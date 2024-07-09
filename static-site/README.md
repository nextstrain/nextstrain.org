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

We use Next.JS' [Pages Router](https://nextjs.org/docs/pages) to define routes based on filenames within `./static-site/pages`.
The [Next.JS dynamic routing](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes) docs explain mapping between filenames and URL paths.

Currently these are the only Next.JS pages we serve. If the path doesn't exist in `./static-site/pages` (and it's not handled elsewhere by the nextstrain.org server) then the default 404 page will be displayed.


### Routing conflicts

As alluded to in [our routing docs](https://docs.nextstrain.org/projects/nextstrain-dot-org/en/latest/routing.html) the presence of Next.JS routing + our own server routing can cause conflicts if not used appropriately.
We'll use an example here to demonstrate how such a conflict could occur:

We currently route requests for `/zika` to the auspice entrypoint.
If a Next.JS page `./static-site/pages/zika.jsx` existed then requests to `/zika` would still go to Auspice, because that route takes priority in our nextstrain.org server route hierarchy.
However if we included a client-side `<Link href='/zika'>` component then via client-side routing you would be able to load the Next.JS Zika page. (Refreshing the page would go back to Auspice, as the browser would make a new request to `/zika`.)
Please don't do this!


## Pages are statically generated

In production mode all pages are statically generated at build time.
Whilst pages may make API requests to the server for information, there is no server-rendering involved.
This mode can be used during development by setting the env variable `USE_PREBUILT_STATIC_SITE=1`; don't forget to build the static-site before running the server (e.g. `npx next build static-site`).

In development mode the pages are dynamically served by the server to allow hot-reloading etc (this is the default situation if you don't specify `NODE_ENV=production` or `USE_PREBUILT_STATIC_SITE=1`)

## Folder structure under ./static-site/src

Prior to using Next.JS we used Gatsby which enforced a specific folder structure which is still visible within `./static-site/src`.
This file structure was kept during the migration to Next.JS but no longer has any significance.
We maintain it here for simplicity but at some point we may do a mass file reorgansiation.

The vast majority of Next.JS pages within `./static-site/pages` are files of only a few lines which import & re-export the appropriate component from within `./static-site/src`.

### public directory

We use a `static-site/public` directory for assets which are exposed at the root (nextstrain.org) URL.
At the moment these largely consist of images used in blog posts.

### static directory

When starting the server you may see a warning message:

> ⚠ The static directory has been deprecated in favor of the public directory.

However assets within this directory (`./static-site/static`) are not exposed.
We may wish to rename this directory to avoid any doubt.

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
2. Add an entry for the team member to the [./src/components/People/teamMembers.js](./src/components/People/teamMembers.js) file in the appropriate list.
   Note that the lists are currently ordered by alphabetical order by the last names.

After the above PR is merged, the new team member can then be added to the [docs.nextstrain.org](https://docs.nextstrain.org) footer.
1. Make a PR in the [nextstrain/sphinx-theme](https://github.com/nextstrain/sphinx-theme) to update the custom [footer](https://github.com/nextstrain/sphinx-theme/blob/main/lib/nextstrain/sphinx/theme/footer.html) with the new team member.
2. Merge the PR and follow [instructions to release a new version of the theme on PyPI](https://github.com/nextstrain/sphinx-theme#releasing).
3. Once the new version is available on PyPI, trigger RTD rebuilds for the latest/stable doc versions to update the footer.


## Deploying
The static documentation is automatically rebuilt every time the (parent) repo is pushed to master.


## License and copyright

Copyright 2014-2023 Trevor Bedford and Richard Neher.

Source code to Nextstrain is made available under the terms of the [GNU Affero General Public License 3.0](../LICENSE) (AGPL-3.0). Nextstrain is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
