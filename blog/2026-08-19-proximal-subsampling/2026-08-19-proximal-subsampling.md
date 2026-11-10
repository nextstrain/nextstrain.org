---
author: "James Hadfield & the Nextstrain team"
date: "2026-08-19"
title: "Proximal subsampling"
sidebarTitle: "Proximal subsampling"
---

The pandemic spurred an interest in sequencing that has led to an abundance of viral genomes, which makes outbreak tracking and linking feasible.
Paradoxically, however, we are often forced to subsample the sequencing data to make analyses computationally tractable.
To help with this issue, we've recently added the `augur proximity` command to find the set of sequences most closely related to a small focal set from within a large set of contextual data.
The proximal sampling is also available as part of Nextstrain's general subsampling approach with the `augur subsample` command.


We've written [a companion how-to guide](https://docs.nextstrain.org/en/latest/guides/bioinformatics/proximal-subsampling.html) to demonstrate the utility of this approach, selecting a small number of geographically-related samples as a mock outbreak and generating phylogenies which include the relevant contextual sequences for understanding the outbreak.



## Table of contents:
* [Augur Proximity](#augur-proximity)
  * [Proximal sampling via Augur Subsample](#proximal-sampling-via-augur-subsample)
  * [Alternate approaches for calculating closeness](#alternate-approaches-for-calculating-closeness)
* [Performance](#performance)
  * [SARS-CoV-2](#sars-cov-2)


# Augur Proximity

[Augur 33.1.0](https://github.com/nextstrain/augur/releases/tag/33.1.0) introduces `augur proximity`, which compares a small set of focal sequences against a large set of contextual sequences to return the set of sequences closest to the focal set.
Closest here means the smallest Hamming distance, i.e. the number of nucleotide differences between two sequences.
In general, finding proximal sequences is quick but memory intensive, see "[Performance](#performance)" below.

There are three parameters you can use to configure how matches are found, see [the docs for full details](https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/proximity.html):
  1. How many closest neighbours to find for each focal sequence (`--k`, default 5)
  1. The maximum allowed Hamming distance for a match (`--max-distance`, default 4)
  1. How missing data (non-ATGC characters) should be considered (`--ignore-missing-data`).
     By default, a valid nucleotide in sequence A and missing data in sequence B would count as a difference.
     Choosing "all" would result in them being considered the same, while "flanking" would do the same only for runs of missing data at the start/end of each sequence.


While you can use the `augur proximity` command by itself, we expect most users to use its capabilities through `augur subsample` to combine it with metadata filtering.

## Proximal sampling via Augur Subsample

`augur subsample` uses a config YAML to define various samples which are combined together to produce the subsampled dataset.
For instance, one sample might filter uniformly across geographical region and time whilst a second sample chooses 1000 recent samples from your country of interest.
It is now possible to add a proximal sample, such as subsampling a set of 1000 sequences which are closest to a set of newly collected outbreak samples.

The [companion how-to guide (docs.nextstrain.org)](https://docs.nextstrain.org/en/latest/guides/bioinformatics/proximal-subsampling.html) shows an example of proximal subsampling via `augur subsample`.
See the [augur subsample docs](https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/subsample.html), specifically the [proximal sample options available](https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/subsample.html#proximal-sample-options) for more details.


<div class="note">

Note that sequences must be aligned to use `augur proximity` or proximal subsampling.
We recommend using `nextclade` to align full datasets due to its speed.

</div>


## Alternate approaches for calculating closeness

So far `augur proximity` uses only Hamming distances as the metric of closeness between sequences.
We elected to use this approach due to its performance and simplicity, as well as its familiarity to bioinformaticians.
There was also historical precedent: in the early days of the SARS-CoV-2 pandemic we implemented a similar approach for contact tracing and there was strong [desire to generalise this approach for other pathogens](https://github.com/nextstrain/ncov/issues/816).

For larger genomes / number of genomes it's not feasible to align all sequences and compare them.
Substring comparisons are commonly used to generate measures of similarity, such as k-mer distributions (see [Moeckel et al (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11152613/) for a review) or sequence hashes (e.g. [Mash](https://pmc.ncbi.nlm.nih.gov/articles/PMC4915045/)).
It's plausible to add support for these approaches within `augur proximity`, and thus make them available for subsampling schemes in the future.
Please [reach out to us](/contact) if these other approaches would be helpful to your work.

Phylogenetic placement is also useful in certain circumstances, where query sequences are added to a fixed reference tree.
[UShER: Ultrafast Sample placement on Existing tRee](https://genome.ucsc.edu/cgi-bin/hgPhyloPlace) is a good example of this, and which currently works for a number of different viruses. 
As Nextstrain doesn't maintain reference trees with all available samples we didn't explore this approach.

---

# Performance


For most viral pathogens, finding proximal sequences across all available data is feasible on a laptop (Figure 1).


<p/>
<div class='figure'>
<img src="/blog/img/proximity-pathogens.png" alt="runtime-memory-for-different-pathogens" />

**Figure 1.**
Runtime and memory usage for 3 viral pathogens, Zika, Influenza H3 (HA segment) and mpox, using all available data as the contextual set and randomly choosing 100 sequences as the focal set and running on 4 cores; all other parameters are default.
Each pathogen was run 3 times using a different focal set; memory usage is peak memory footprint as measured on MacOS.

</div>

Performance is mainly affected by the number of sequences involved (Figure 2).
Peak memory usage is essentially determined by the number of contextual sequences x the sequence length (bp), and changes to sequence size (pink) or number of contextual sequences (purple) affect runtime and memory in a linear fashion.
Changing the number of focal sequences (red) typically does not affect memory (as their numbers are tiny compared to the number of contextual sequences), but affects runtime in a linear fashion.
The choice of k (teal) or max-distance (yellow) parameters have negligible effects on runtime & memory, however how missing data is handled (orange, blue) does increase runtime and/or memory.
Finally, parallalisation (green) is extremely good, with no effect on overall memory consumption.



<p/>
<div class='figure'>
<img src="/blog/img/proximity-param-changes.png" alt="effect-of-parameters-on-runtime-memory" />

**Figure 2.**
The effect of parameter choices and input data on runtime and memory.
Results are of three independent runs using a real-life dataset of Influenza A PB1 sequences (2.3kb), with a focal set of n=800 and a contextual set of n=374k sequences.
The baseline runs, to which these changes are compared against, were run using 4 cores and took an average of 1m32s runtime and 1.88GB peak memory.
This experimental setup was chosen to show that finding the genetically closest sequences across the entire available Influenza dataset is possible without the need to first sample to HA/NA types.

</div>




## SARS-CoV-2

Full analysis of SARS-CoV-2 datasets is not possible at the moment (Figure 3).
This is primarily due to our implementation storing all contextual genomes in memory using a single NumPy matrix to enable vectorised distance computation.
There are a number of improvements we could make, such as chunking contextual sequences or representing individual sequences as their differences relative to a canonical / reference sequence.
We don't think that exhaustively finding proximal sequences over the entire SARS-CoV-2 database is necessary or valid at the moment and thus haven't pursued these optimisations.


If you do want to find proximal sequences for SARS-CoV-2 or similar sized datasets, we recommend first filtering the contextual sequences to a relevant set.
For instance, filtering contextual sequences to a single Nextstrain clade via [augur filter](https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/filter.html), which is memory efficient for large datasets.
Figure 3 should help guide the number of contextual sequences your environment can handle.



<p/>
<div class='figure'>
<img src="/blog/img/proximity-ncov.png" alt="ncov-analyses" />

**Figure 3.**
Finding proximal sequences for nCoV is memory bound.
In our current implementation both runtime and memory scale linearly with the number of contextual sequences, making full analysis of SARS-CoV-2 genomes unfeasible as currently there are over 9M genomes available on GenBank.
Results of 5 replicates, using 16 cores on an AWS EC2 c7a.12xlarge instance and measuring maximum RSS memory usage.

</div>

