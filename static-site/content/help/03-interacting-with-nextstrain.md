---
title: "Interacting with Nextstrain's phylogeographic visualisations"
---

**Following content cut from what was previously /docs/interpretation/auspice, which will redirect to this page**


Visualization of bioinformatics results is an integral part of phylodynamics, both for data exploration and communication.
We wanted to build a tool that was highly interactive, versatile, and usable as a communication platform to quickly disseminate results to the wider community.
Auspice is written in JavaScript and is the app that powers all the phylogenomic analysis on nextstrain.org. The code is completely open-source and may be found on [Github](https://www.github.com/nextstrain/auspice)).


![mumps](figures/mumps.png)
*Auspice displaying mumps genomes from North America. See [nextstrain.org/mumps/na](https://www.nextstrain.org/mumps/na)*

### General Design Overview
We wanted to build a powerful, yet not overly complex visualization tool.
Currently this is centered around a number of "panels".
These allow us to display relationships between isolates such as their phylogenetic relationships, putative transmissions on the map, and variability across the genome.
Color is used consistently throughout the app in order to link different panels.
The generator of the data controls which traits are able to be visualized. For instance, transmissions can be turned off if the data is not informative.
A number of controls are made available in a sidebar to control the time period viewed, the layout of the tree, etc.

We are currently working on allowing scientists to author custom narratives which describe the data, and control how the data is visualized as one progresses through the narrative.
See [here](/docs/narratives/introduction) for more information.

### Auspice is Agnostic About Where the Data Comes From
We build bioinformatic tooling (Augur, docs [here](/docs/bioinformatics/introduction-to-augur)) to produce JSONs specifically for visualization in Auspice.
However any compatible JSONs can be visualized through Auspice -- either locally, or via nextstrain.org (see below).
**The data doesn't have to be viral genomes, or real-time, or generated in Augur!**

We're working on adding tutorials on how to convert BEAST results etc., into the formats used by Auspice.
In the meantime, the JSON file formats are specified [here](/docs/bioinformatics/data-formats).


### Running Locally
Auspice can be run locally to visualize datasets.
See [local installation](/docs/getting-started/local-installation) for how to get up and running.

```
auspice view --datasetDir <dir>
```
where `<dir>` contains the JSONs. This command makes the data available to view in a browser at localhost:4000.

### Private (Non-Public) Datasets
We are looking to include logins / accounts through nextstrain.org in order to serve private datasets, but this feature is not currently available.
