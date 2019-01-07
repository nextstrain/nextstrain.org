---
title: "Interactive Bioinformatics Visualisation using Auspice"
---

Visualisation of bioinformatics results is an integral part of current phylodynamics, both for data exploration and communication.
We wanted to build a tool that was highly interactive, versatile and usable as communication platform to quickly disseminate results to the wider community.
Auspice is written in JavaScript and is the app that powers all the phylogenomic analysis on nextstrain.org (github repo [here](https://www.github.com/nextstrain/auspice)).


![mumps](figures/mumps.png)
*Auspice displaying Mumps genomes from North America. See [nextstrain.org/mumps/na](https://www.nextstrain.org/mumps/na)*

### General design overview
We wanted to build a powerful yet not overly complex visualisation tool.
Currently this is centered around a number of "panels".
These allow us to display relationships between isolates such as their phylogenetic relationships, putative transmissions on the map, variability across the genome.
Colour is used consistently throughout the app in order to link different panels.
The generator of the data controls which traits are able to be visualised - for instance, transmissions can be turned off if the data is not informative.
A number of controls are made available in a sidebar to control the time period viewed, the layout of the tree etc.

We are currently working on allowing scientists to author custom narratives which describe the data, and control how the data is visualised as one progresses through the narrative.
See [here](/docs/visualisation/narratives) for more information.

### Auspice is agnostic about where the data came from
We build bioinformatic tooling (augur, docs [here](/docs/bioinformatics/introduction)) to produce JSONs specifically for visualisation in Auspice.
However any compatible JSONs can be visualised through auspice -- either locally, or via nextstrain.org (see below).
**The data doesn't have to be viral genomes, or real-time, or generated in Augur!**
We're working on adding tutorials on how to convert BEAST results etc into the formats used by Auspice.
In the meantime, the JSON file formats are specified [here](/docs/bioinformatics/output-jsons).


### Viewing your data through nextstrain.org
Our desire is to develop a community of scientists using nextstrain.org to share datasets, and to allow these to be easily updated so that they represent the most up-to-date view of the current situation.
We currently utilise GitHub to achieve this, whereby if JSONs are committed to github repos they can be automatically accessed through nextstrain.org.


Given a repository at **github.com/orgName/repoName**, if there is a folder named **auspice** with JSONs **repoName_tree.json** and **repoName_meta.json**, then that dataset can be accessed via **nextstrain.org/community/orgName/repoName**.
Additional datasets named such as **repoName\_a\_b\_c\_meta.json** are available at **nextstrain.org/community/orgName/repoName/a/b/c**.


For example, [Alli Black's](https://bedford.io/team/allison-black/) analysis of Zika virus in the US Virgin Islands is being updated [in this github repo](https://github.com/blab/zika-usvi/), and you can see the most up-to-date results at [nextstrain.org/community/blab/zika-usvi](https://www.nextstrain.org/community/blab/zika-usvi)


### Running locally
Auspice can be run locally to visualise datasets.
See [this documentation](/docs/getting-started/installation) for how to install and run Auspice locally.


### Private (non public) datasets
We are looking to include logins / accounts through nextstrain.org in order to serve private datasets, but this feature is not currently available.
