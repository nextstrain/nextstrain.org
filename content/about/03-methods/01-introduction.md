---
title: "Methods overview"
---

## Nextstrain Components

The Nextstrain architecture consists of three components. We maintain a database (fauna) with associated ingest scripts to scrape publicly available sequences and clean up metadata. Cleaned sequences are passed from the database to our bioinformatic processing pipeline (augur) that aligns sequences, constructs phylogenies, infers a temporal scale and reconstructs geographic transmission history. The informatic scripts are handled offline and are rerun as new data appears in public databases. The resulting processed data is uploaded as a package that is queried by our client-side visualization (auspice). The use of these components is described in [docs](/docs).


## Data Collection

We maintain a database of publicly available sequences and have written a number of scripts to ingest and canonicize data from different sources. This database, which is regularly updated, allows downloading of Zika, Ebola and influenza genomes in FASTA format.

## Filtering

The first step in the processing pipeline is to automatically select a subset of representative viruses. This subsampling step is virus dependent. For influenza virus, sequences are subsampled to achieve a more equitable temporal and geographic distribution. In the case of Zika or Ebola virus, substantial subsampling is not necessary and we mostly remove low quality sequences or duplicates. Here, we also remove duplicate viruses and known reassortant clusters in influenza.

## Alignment

Augur then aligns the selected sequences using [MAFFT](http://mafft.cbrc.jp/alignment/software/). Once aligned, the set of virus sequences is further cleaned by removing insertions relative to a reference sequence to enforce canonical site numbering and by removing sequences that show either too much or too little divergence relative to the expectation given their sampling date. As reference for each viral lineage, we chose a well characterized virus without defining the canonical amino-acid numbering.

## Tree Building

From the filtered and cleaned alignment, we build a phylogenetic tree using [FastTree](http://www.microbesonline.org/fasttree/), which is then further refined using [RAxML](http://sco.h-its.org/exelixis/web/software/raxml/index.html). Next, augur uses [treetime](https://github.com/neherlab/treetime) to infer a time tree based on the tree topology determined by RAxML and to infer nucleotide sequence and geographic location of every internal node of the tree. Missing sequence data at phylogeny tips is filled with the nearest ancestral sequence at these sites. The final tree is decorated with the attributes to be displayed in the browser.
