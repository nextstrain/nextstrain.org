---
title: "Downloading the data displayed through nextstrain.org"
anchorText: "Download Data"
---


We make it possible to download the derived data behind the visualisations on nextstrain.org for your own further analysis.
We've made the decision _not_ to make the sequence data downloadable as a lot of the original data
sources have data sharing restrictions which this would violate.
The genbank & GISAID accessions, if applicable, are contained in the metadata download should you wish to access the original sequence data.
Unpublished data is included with permission of the data generators, and does not impact their right to publish.
Please contact the respective authors (available via the TSV files below) if you intend to carry out further research using their data. 


> The **DOWNLOAD DATA** button can be found at the very bottom of any nextstrain.org visualisation & brings up a display showing the following options:


### Phylogenetic Trees

You can download newick trees with branch lengths either in terms of (genetic) divergence or time.
To ascertain the units for divergence please check the axis label of main tree visualisation -- they are either subs/site/year or mutations.
Time is always measured in years, and if you are using python then [TreeTime](https://github.com/neherlab/treetime) provides a helper function `datetime_from_numeric` to parse these. 
Exported trees always contain the entirety of the data, and do not reflect any current filtering or zooming in the app.


### Metadata

Per-strain (per-genome) metadata is available for both all samples in the dataset as well as samples which are currently displayed.
This allows you to filter the data and zoom into subclades of interest within the tree, and then grab the metadata for only those samples being visualised.
The metadata included in this TSV contains all of the traits (colour options, authorship etc) made available in the visualisation.
This data is roughly the same as what is displayed when clicking on an individual tip in the tree.


Additionally, you can download an "authors" metadata table where each row corresponds to an author of samples in the dataset, and includes a list of the different samples associated with them.
You may also see this information by clicking on a tip within the tree, and datasets often provide authors as one of the possible dataset colourings.
Note that this table always represents all the data in the dataset and does not reflect any current filtering or zooming in the app.

### Diversity (entropy) data

A TSV is available for the data behind the entropy (diversity) panel.
The produced data will exactly mirror what you are seeing in the diversity panel when you click "download data".
For instance, if you have selected "events" and "nt", and used the tree to zoom into a subtree of the data, then you'll download a list of nucleotide positions and the count of observed base changes across the visible subtree at each of those positions.
The slight exception to this is that data representing the entire length of the genome (or viral segment, as displayed in the diversity panel) will be downloaded, that is, the zooming within the entropy panel will be ignored.

Note that no data will be produced for positions where no genomic variablity is observed in the dataset, or for any sites which may have been masked during the analysis and are therefore not in the data which the visualisation uses.

**Entropy** is normalised [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory)), measuring the "uncertainty" inherent in the possible nucleotides or codons at a given position.

**Events** represent a count of changes in the nucleotide or codon at that position across the (displayed) (sub-)tree.
They rely on the ancestral state reconstruction to infer where these changes occured within the tree.


### SVG Screenshot

This produces a vector image for downstream editing and display.
Screenshots are licensed with a [CC-BY](https://creativecommons.org/licenses/by/4.0/) license -- please credit the authors behind the genomic data as well as Nextstrain!

We are aware that the produced screenshot sometimes contain formatting errors -- please check the produced file against what you see on nextstrain.org!



