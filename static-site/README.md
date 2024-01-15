<div align="center">
    <img src="static/logos/nextstrain_should_be_svg.png" alt="Logo" width='472px' height='100px'/>
</div>

<br/>

# Nextstrain static site
This directory contains the documentation files and static site generator for nextstrain.
For general `nextstrain.org` documentation including the nextstrain server (including the `/charon/...` API endpoints) and auspice customizations, see [nextstrain.org/README.md](../README.md).

## Installing

See [the readme](../README.md#build-nextstrainorg-locally) in the parent directory for instructions on how to install prerequisites and install nextstrain.org locally.

### Developing locally

For most cases, development servers for nextstrain.org can by run from the root of this repo - see the main README section: [Build nextstrain.org in development mode](../README.md#run-server-in-development-mode).

To develop just the static-site part of nextstrain.org, you may run:

```
npm install
npm run develop
```

Note that certain parts of the gatsby site rely on API handlers not implemented in the gatsby dev server.
For these to work in development mode, you should run the gatsby dev server while also running the nextstrain.org server - see the main README section: [Build nextstrain.org in development mode](../README.md#run-server-in-development-mode).

### Testing the production build

If you wish to test the production build of just the static-site portion of nextstrain.org, you may run:

```
npm install
npm run build
npm run serve
```

### Troubleshooting installation on MacOS

**sharp build failures**

Building `sharp` from source requires `vips` and `pkg-config`, which may be
installed via homebrew (`brew install vips pkg-config`). See [this
issue](https://github.com/nextstrain/nextstrain.org/issues/597) for more.



### Troubleshooting on Linux
If `npm install` fails and you are getting an error about the Gatsby `sharp` plugin dependency, it could be related to the [Node support for sharp issue reported here](https://github.com/lovell/sharp/issues/1668). We have found the best results with version 10 of Node -- run `node -v` to check which version you have. Please see [the readme in the parent directory](../README.md#build-nextstrainorg-locally) for our recommended way to install these dependencies. (If you're using `nvm` to manage node installations, you can try running `nvm install 10`).
After this, `node -v` should display `v10.*`.


Delete the `node_modules/` folder and run `npm install` again.
If that still doesn't work, delete the `node_modules/` folder again and run the following commands:
```sh
npm install sharp
npm install
```


If `npm run develop` fails and you are getting an error about `pngquant`, delete the `node_modules/` folder and run the following commands:
```sh
sudo apt-get install libpng-dev
npm install
```


## Adding content
* [See this page in the docs](https://nextstrain.org/docs/contributing/documentation)

### Adding new cards / tiles for the splash page
1. Find an image with appropriate rights for us to use. Generally, anything on Wikimedia Commons is fair game with proper attribution. Please consult the licensing section of individual files to be sure.
2. Edit the picture in [LunaPic](https://www110.lunapic.com/editor/)
    * upload picture
    * Style the picture via the "art" menu. Choose "grey" for core cards, "floating" for community cards or "sadness" for narrative cards. Adjust slider as you see fit.
    * "Edit" -> "Simple Crop Tool" & crop to a square.
    * "Edit" -> "Scale Image" to 250 x 250px
    * "File" -> "Save Image" & use PNG
3. Save the file in `./static/splash_images`
4. Edit `./src/components/Cards/coreCards.js`, `./content/community-datasets.yaml` or `./src/components/Cards/narrativeCards.js` to include the card & title.
5. Edit `./src/components/Footer/index.jsx` to provide credit for the photo.

### Adding new team members

To add a new team member to the [nextstrain.org/team](https://nextstrain.org/team) page, make a PR in this repo with the following changes:
1. Add an image for the team member to the [./static/team](./static/team) directory.
2. Add an entry for the team member to the [./src/components/People/teamMembers.js](./src/components/People/teamMembers.js) file in the appropriate list.
   Note that the lists are currently ordered by alphabetical order by the last names.

After the above PR is merged, the new team member can then be added to the [docs.nextstrain.org](https://docs.nextstrain.org) footer.
1. Make a PR in the [nextstrain/sphinx-theme](https://github.com/nextstrain/sphinx-theme) to update the custom [footer](https://github.com/nextstrain/sphinx-theme/blob/main/lib/nextstrain/sphinx/theme/footer.html) with the new team member.
2. Merge the PR and follow [instructions to release a new version of the theme on PyPI](https://github.com/nextstrain/sphinx-theme#releasing).
3. Once the new version is available on PyPI, trigger RTD rebuilds for the latest/stable doc versions to update the footer.

### External Links in the sidebar

The `./additional_sidebar_entries.yaml` file defines external links which we wish to display in the sidebar of the documentation & help pages.
These will be displayed with a small icon indicating that they are external links (the rendering component is at `./src/components/Sidebar/index.jsx`).


## Deploying
The static documentation is automatically rebuilt every time the (parent) repo is pushed to master.


## License and copyright

Copyright 2014-2023 Trevor Bedford and Richard Neher.

Source code to Nextstrain is made available under the terms of the [GNU Affero General Public License 3.0](../LICENSE) (AGPL-3.0). Nextstrain is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
