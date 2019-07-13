---
title: "Interactive Bioinformatics Visualization using Auspice"
---

Visualization of bioinformatics results is an integral part of current phylodynamics, both for data exploration and communication.
We wanted to build a tool that was highly interactive, versatile and usable as communication platform to quickly disseminate results to the wider community.
Auspice is written in JavaScript and is the app that powers all the phylogenomic analysis on nextstrain.org. The code is completely open source and may be found on [Github](https://www.github.com/nextstrain/auspice)).


![mumps](figures/mumps.png)
*Auspice displaying Mumps genomes from North America. See [nextstrain.org/mumps/na](https://www.nextstrain.org/mumps/na)*

### General design overview
We wanted to build a powerful yet not overly complex visualization tool.
Currently this is centered around a number of "panels".
These allow us to display relationships between isolates such as their phylogenetic relationships, putative transmissions on the map, variability across the genome.
Color is used consistently throughout the app in order to link different panels.
The generator of the data controls which traits are able to be visualized - for instance, transmissions can be turned off if the data is not informative.
A number of controls are made available in a sidebar to control the time period viewed, the layout of the tree etc.

We are currently working on allowing scientists to author custom narratives which describe the data, and control how the data is visualized as one progresses through the narrative.
See [here](/docs/narratives/introduction) for more information.

### Auspice is agnostic about where the data came from
We build bioinformatic tooling (augur, docs [here](/docs/bioinformatics/introduction-to-augur)) to produce JSONs specifically for visualization in Auspice.
However any compatible JSONs can be visualized through auspice -- either locally, or via nextstrain.org (see below).
**The data doesn't have to be viral genomes, or real-time, or generated in Augur!**

We're working on adding tutorials on how to convert BEAST results etc into the formats used by Auspice.
In the meantime, the JSON file formats are specified [here](/docs/bioinformatics/data-formats).


### Running locally
Auspice can be run locally to visualize datasets.
See [local installation](/docs/getting-started/local-installation) for how to get up and running.


### Private (non public) datasets
We are looking to include logins / accounts through nextstrain.org in order to serve private datasets, but this feature is not currently available.
