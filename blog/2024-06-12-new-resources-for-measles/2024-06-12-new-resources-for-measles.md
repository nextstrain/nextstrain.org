---
author: "Kim Andrews, Jover Lee, James Hadfield, Jennifer Chang, Trevor Bedford"
date: "2024-06-12"
title: "New Resources for Measles Virus"
sidebarTitle: "New Resources for Measles"
---

We now provide regularly updated phylogenetic monitoring of measles virus at [nextstrain.org/measles](/measles). This site displays phylogenies generated using genomic data from NCBI GenBank, and is updated daily when new sequences are uploaded to NCBI. You can choose to display one of two different phylogenies based on the following data types:

1. Full genome sequences
1. 450bp region of the N gene ("N450")

In both phylogenies, sequences are classified to genotype using the [nomenclature system established by the World Health Organization](https://iris.who.int/bitstream/handle/10665/241889/WER8709_73-80.PDF?sequence=1).

As part of this work, we developed an [open-source tool for classifying measles genotypes](https://clades.nextstrain.org/?dataset-name=nextstrain/measles/N450/WHO-2012). This tool is a [Nextclade dataset](https://docs.nextstrain.org/projects/nextclade/en/stable/user/datasets.html), which allows users to drag-and-drop sequences onto a web browser to obtain genotype classifications. It also outputs sequence quality control metrics and displays user sequences on a phylogenetic tree.

We also provide links, updated daily, where all NCBI GenBank measles [sequences](https://data.nextstrain.org/files/workflows/measles/sequences.fasta.zst) and [metadata](https://data.nextstrain.org/files/workflows/measles/metadata.tsv.zst) can be downloaded. These currently include over 23,000 sequences, of which ~1,000 are full genome sequences, and ~19,000 include the N450 region.

With [measles cases currently increasing globally](https://www.who.int/news/item/16-11-2023-global-measles-threat-continues-to-grow-as-another-year-passes-with-millions-of-children-unvaccinated), we expect these tools to be useful resources for tracking the spread of this viral pathogen. This work is made possible by the open sharing of genetic data by research groups from all over the world. We gratefully acknowledge their contributions.


[![tree-genome](/blog/img/measles_tree_genome_2024-06-10.png)](/measles/genome)
**Fig 1.** Phylogeny of full genome sequences for measles.

[![tree-N450](/blog/img/measles_tree_N450_2024-06-10.png)](/measles/N450)
**Fig 2.** Phylogeny of N450 sequences for measles.

[![measles-nextclade](/blog/img/measles_nextclade.png)](https://clades.nextstrain.org/?dataset-name=nextstrain/measles/N450/WHO-2012)
**Fig 3.** Example of output for the measles Nextclade dataset.
