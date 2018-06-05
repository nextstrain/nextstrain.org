<div align="center">
    <img src="static/logos/nextstrain_should_be_svg.png" alt="Logo" width='472px' height='100px'/>
</div>

<br/>


[![Build Status](https://travis-ci.com/nextstrain/static.svg?branch=master)](https://travis-ci.com/nextstrain/static)


The nextstrain project is an attempt to make flexible informatic pipelines and visualization tools to track ongoing pathogen evolution as sequence data emerges.
This repository contains the code and content behind the static parts of nextstrain.org (the interactive app codebase is [here](http://github.com/nextstrain/auspice)).


Please see [https://nextstrain.org/docs/static-content/introduction](https://nextstrain.org/docs/static-content/introduction) for more detailed information on how this code is organised and how to add content in the form of markdown files.


### Installing
* `git clone https://github.com/nextstrain/static.git`
* make sure npm & node are installed (on linux & OS-X, [installing nvm](https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/) is the best way to do this)
* `npm install`

### Building locally
* dev mode: `npm run dev`
* compile & serve: `npm run build && npm run serve`
* _note that the interactive dataset page (e.g. /zika) will 404 when built locally_

### Adding content
* add markdown files to the `/content` directory
* [this page](https://nextstrain.org/docs/static-content/writing-content) explains the format required

### Deploying:
* simply push to master. That's it! (Travis CI takes care of the rest)

## License and copyright

Copyright 2014-2018 Trevor Bedford and Richard Neher.

Source code to Nextstrain is made available under the terms of the [GNU Affero General Public License](LICENSE.txt) (AGPL). Nextstrain is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
