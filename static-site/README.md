<div align="center">
    <img src="static/logos/nextstrain_should_be_svg.png" alt="Logo" width='472px' height='100px'/>
</div>

<br/>


This directory contains the documentation files and static site generator for nextstrain.

### Developing locally

> See `../set-up.sh` for how this site is built during production

```bash
npm install # this needs python 2
npm run develop
```

To test the built version:
```bash
npm run build
npm run serve
```

#### Troubleshooting on Linux
If `npm install` fails and you are getting an error about the Gatsby `sharp` plugin dependency, it could be related to the [Node support for sharp issue reported here](https://github.com/lovell/sharp/issues/1668). Check your `node -v`. If you don't have version 10 installed, run `conda install nodejs=10`. Now `node -v` should display `v10.*`. Delete the `node_modules/` folder and run `npm install` again.
* If that still doesn't work, delete the `node_modules/` folder again and run the following commands:
    ```sh
    npm install sharp
    npm install
    ```
If `npm run develop` fails and you are getting an error about `pngquant`, delete the `node_modules/` folder and run the following commands:
  ```sh
  sudo apt-get install libpng-dev
  npm install
  ```


### Adding content
* add markdown files to the `/content` directory


### Deploying
The static documentation is automatically rebuilt every time the (parent) repo is updated.


## License and copyright

Copyright 2014-2018 Trevor Bedford and Richard Neher.

Source code to Nextstrain is made available under the terms of the [GNU Affero General Public License](LICENSE.txt) (AGPL). Nextstrain is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
