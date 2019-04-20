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

### Adding content
* add markdown files to the `/content` directory


### Deploying
The static documentation is automatically rebuilt every time the (parent) repo is updated.


## License and copyright

Copyright 2014-2018 Trevor Bedford and Richard Neher.

Source code to Nextstrain is made available under the terms of the [GNU Affero General Public License](LICENSE.txt) (AGPL). Nextstrain is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
