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

To develop just the static-site part of nextstrain.org, you may run:

```
npm install
npm run develop
```

Note that certain parts of the gatsby site rely on API handlers not implemented in the gatsby dev server.
For these to work in development mode, you should also run the nextstrain.org server on port 5000 via
`npm run server` from the root of this repo. 

### Testing the production build

If you wish to test the production build of just the static-site portion of nextstrain.org, you may run:

```
npm install
npm run build
npm run serve
```

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
1. Find an image with appropriate rights for us to use.
2. Edit the picture in [LunaPic](https://www110.lunapic.com/editor/)
    * upload picture
    * Style the picture via the "art" menu. Choose "grey" for core cards, "floating" for community cards or "sadness" for narrative cards. Adjust slider as you see fit.
    * "Edit" -> "Simple Crop Tool" & crop to a square.
    * "Edit" -> "Scale Image" to 250 x 250px
    * "File" -> "Save Image" & use PNG
3. Save the file in `./static/splash_images`
4. Edit `./src/components/Cards/coreCards.js`, `./src/components/Cards/communityCards.js` or `./src/components/Cards/narrativeCards.js` to include the card & title.
5. Edit `./src/Footer/index.jsx` to provide credit for the photo.

### External Links in the sidebar

The `./additional_sidebar_entries.yaml` file defines external links which we wish to display in the sidebar of the documentation & help pages.
These will be displayed with a small icon indicating that they are external links (the rendering component is at `./src/components/Sidebar/index.jsx`).


## Deploying
The static documentation is automatically rebuilt every time the (parent) repo is pushed to master.


## License and copyright

Copyright 2014-2018 Trevor Bedford and Richard Neher.

Source code to Nextstrain is made available under the terms of the [GNU Affero General Public License](LICENSE.txt) (AGPL). Nextstrain is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
