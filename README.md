<div align="center">
    <img src="static/logos/nextstrain_should_be_svg.png" alt="Logo" width='472px' height='100px'/>
</div>

<br/>

The nextstrain project is an attempt to make flexible informatic pipelines and visualization tools to track ongoing pathogen evolution as sequence data emerges.
Nextstrain is comprised of four components: sacra, flora, augur & auspice (see below).

This repository will form the static components of [nextstrain.org](nextstrain.org), including:
* The [nextstrain.org](nextstrain.org) splash page
* Tutorials
* Code documentation
* Blog Posts
* Narrative markdown files

The other components of nextstrain are:
* [Sacra](github.com/nextstrain/sacra) data cleaning scripts
* [Flora](github.com/nextstrain/flora) database management
* [Augur](github.com/nextstrain/augur) bioinformatics analysis pipelines
* [Auspice](github.com/nextstrain/auspice) interactive visualisation app


### Contributing to this website
This website is built using [gatsby](https://github.com/gatsbyjs/gatsby/), which uses [react](reactjs.org) and [GraphQL](http://graphql.org/learn/) to build a static website from markdown files.
To contribute tutorials, blog posts etc all that should be required is to add Markdown files to `/content`.
Instructions for writing Markdown posts can be found at [nextstrain.org/docs/static-website/introduction](https://static.nextstrain.org/docs/static-website/introduction).

To build locally you'll need Node, npm and git installed. Then run:

```
git clone https://github.com/nextstrain/nextstrain.org.git
cd nextstrain.org
npm install
npm start
```

Then go to [http://localhost:8000](localhost:8000) to view content.

### Deploying this website

To deploy to Heroku set buildpacks with:

```
heroku buildpacks:set heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
```

Deploy can then be updated with just:

```
git push -f heroku master
```

### Nextstrain built by

Trevor Bedford, Richard Neher, James Hadfield, Barney Potter, John Huddleston, Sidney Bell, Colin MeGill, Emma Hodcroft, Pavel Sagulenko and Charlton Callender.

<div display="flex" align="center">
    <img src="static/logos/fred-hutch-logo.png" alt="Logo" width='200px'/>
    <img src="static/logos/bz_logo.png" alt="Logo" width='200px'/>
    <img src="static/logos/osp-logo-small.png" alt="Logo" width='200px'/>
</div>
<div display="flex" align="center">
    <img src="static/logos/erc-logo.jpg" alt="Logo" width='200px'/>
    <img src="static/logos/nih-logo.jpg" alt="Logo" width='200px'/>
    <img src="static/logos/max-planck-logo.png" alt="Logo" width='200px'/>
</div>
