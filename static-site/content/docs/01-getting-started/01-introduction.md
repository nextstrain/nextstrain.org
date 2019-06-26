---
title: "Nextstrain: analysis and visualisation of pathogen sequence data"
---

Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data with powerful analytics and visualizations showing pathogen evolution and epidemic spread. Our goal is to aid epidemiological understanding and improve outbreak response. If you have any questions, or simply want to say hi, please give us a shout at hello@nextstrain.org.


### What is Nextstrain?

Nextstrain is a collection of open-source tools to aid in our understanding of pathogen spread and evolution, especially in outbreak scenarios.
We have designed these in such a way that they can be used with a wide range of data sources, and are easy to replace with your own tooling.
Broadly speaking, Nextstrain consists of 
* "augur" -- a series of composable, modular (unix-like) bioinformatics tools.
We use these to create recipes for different pathogens and different analyses, which are easy to reproduce when new data is available.
* "auspice" -- a web-based visualization program, to present & interact with phylogenomic & phylogeographic data. 
This is what you see when, for example, you visit [nextstrain.org/zika](https://www.nextstrain.org/zika), but it can also run locally on your computer.


This architecture allows us to
- perform sequence analysis -- including subsampling, alignment, tree-inference, node dating etcetera -- by running a series of [augur commands](../bioinformatics) in discrete steps.
- use additional tools & scripts within a given bioinformatics recipe to add additional functionality.
- replace modules, or series of modules with other analysis tools (e.g. BEAST).
- interpret our data -- no matter what analysis recipe we used -- within auspice on our computer.
- share our results to collaborators or other scientists through nextstrain.org
- rerun analysis as new data become available


We use these tools to provide a continually-updated view of publicly available data for certain important pathogens such as [influenza](https://www.nextstrain.org/flu), [Ebola](https://www.nextstrain.org/ebola) and [Zika](https://www.nextstrain.org/zika) viruses.
These data are continually updated whenever new genomes are made available, thus providing the most up-to-date view possible.


More information:
* [Augur documentation](../bioinformatics)
* [Auspice documentation](/docs/visualisation/introduction)



### Motivation

We built Nextstrain in an attempt to provide a rapid and automatable bioinformatics pipeline for analysis of pathogens in order to better harness the scientific and public health potential of pathogen genome data.
Open sharing of derived data (such as phylogenies and transmission reconstructions) through [nextstrain.org](https://www.nextstrain.org) is a core priority.
There is now a growing community of researchers using these tools, with a focus on fast analysis times, interactive visualization and data sharing.
Our model for data analysis and sharing is for scientists to store the code used for their analyis in GitHub repositories, and if the results are also stored in these repositories they are automatically made available through `nextstrain.org/community/...` URLs (see [here](/docs/pathogen-builds/introduction) for more details).


### How to get started

* If you would like to investigate live datasets, [head back to the splash page](/) and click on any of the tiles.
* If you would like to use Nextstrain to process and visualise your own data, you can either start with the [Quickstart](/docs/getting-started/quickstart) which uses a Docker container to run the builds automatically, or follow the [Zika Tutorial](/docs/getting-started/zika-tutorial) which provides a more hands-on approach to processing the data.
* If you have data generated from other sources (e.g. BEAST, RAxML, etc...) then please watch this space -- we'll add tutorials for these soon!

### Contact us

We are keen to keep expanding the scope of Nextstrain and empowering other researchers to better analyse and understand their data.
Please [get in touch with us](mailto:hello@nextstrain.org) if you have any questions or comments.

### Publication

Hadfield et al., [Nextstrain: real-time tracking of pathogen evolution](https://doi.org/10.1093/bioinformatics/bty407), _Bioinformatics_ (2018)
