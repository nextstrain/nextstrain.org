---
title: "Nextstrain: analysis & visualisation of pathogen sequence data"
date: "2018-08-23"
---

Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data with powerful analytics and visualizations showing pathogen evolution and epidemic spread. Our goal is to aid epidemiological understanding and improve outbreak response. If you have any questions, or simply want to say hi, please give us a shout at hello@nextstrain.org.


### What is nextstrain
Nextstrain is a collection of open-source tools to aid in our understanding of pathogen spread & evolution, especially in outbreak scenarios.
We have designed these in such a way that they can be used with a wide range of data sources, and are easy to replace with your own tooling.
Broadly speaking, nextstrain consists of a modular-base bioinformatics pipeline, and a web-based visualisation program.
Note that data analysed outside of nextstrain can still be visualised here, and similarly the results of nextstrain-analysis is easily interpretable for further downstream analysis and custom visualisations.


We use these tools to provide a continually-updated view of publicly available data for certain important pathogens such as [influenza](https://www.nextstrain.org/flu), [ebola](https://www.nextstrain.org/ebola) and [zika](https://www.nextstrain.org/zika) viruses.
These data are continually updated whenever new genomes are made available, thus providing the most up-to-date view possible.


### Motivation
We built nextstrain in an attempt to provide a rapid and automatable bioinformatics pipeline for analysis of pathogens in order to better harness the scientific and public health potential of pathogen genome data.
Open sharing of derived data (such as phylogenies and transmission reconstructions) through [nextstrain.org](https://www.nextstrain.org) is a core priority.
There is now a growing community of researchers using these tools, with a focus on fast analysis times, interactive visualisation & data sharing.
Our model for data analysis and sharing is for scientists to store the code used for their analyis in GitHub repositories, and if the results are also stored in these repositories they are automatically made available through `nextstrain.org/community/...` URLs (see [here](docs/pathogen-builds/introduction) for more details).


### Moving Parts
1. Sequence analysis is performed by a series of steps which we refer to as modules (these are effectively individual command-line scripts).
Since they are just a series of self-contained steps, it's trivial to customise which steps are run and to add your own.
These steps can include subsampling, alignment, tree-inference, node dating etc.
[See here](/docs/bioinformats/introduction) for more details.
2. Visualisation is via a javascript-based web app, which is what you see when you access datasets such as [nextstrain.org/zika](https://www.nextstrain.org/zika).
This can be installed locally, and as long as your data is in the correct format it can be visualised.
[See here](/docs/visualisation/introduction) for more details.


### How to get started
* If you would like to visualise datasets, [head back to the splash page](/) and click on any of the tiles.
* If you would like to use nextstrain to process and visualise your own data, you can either start with the [quickstart](/docs/getting-started/quickstart) which uses a docker container to run the builds automatically, or follow the [zika tutorial](/docs/getting-started/zika-tutorial) which provides a more hands-on approach to processing the data.
* If you have data generated from other sources (e.g. BEAST, RAxML etc) then please watch this space -- we'll add tutorials for these soon!



### Contact us
We are keen to keep expanding the scope of nextstrain and empowering other researchers to better analyse and understand their data.
Please don't hesitate to [get in touch with us](mailto:hello@nextstrain.org) if you have any questions or comments.

### Publication
Hadfield et al., [Nextstrain: real-time tracking of pathogen evolution](https://doi.org/10.1093/bioinformatics/bty407), _Bioinformatics_ (2018)
