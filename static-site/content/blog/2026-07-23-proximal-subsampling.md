---
author: "James Hadfield & the Nextstrain team"
date: "2026-07-23"
title: "Proximal subsampling"
sidebarTitle: "Proximal subsampling"
---

_TODO XXX - update date of post..._

_TODO XXX - the tutorial section uses the `proximal-subsampling` branch / [PR 124](https://github.com/nextstrain/measles/pull/124) We need to merge that and update links here accordingly_

The increasing abundance of viral genomes, spurred on by the pandemic, has paradoxically made outbreak tracking and linking feasible at the same time as we are forced to subsample sequencing data to make analyses computationally tractable.
Here we describe a recent addition to Augur, `augur proximity` which finds the set of samples most closely related to a small focal set across a large set of contextual data.
This is available to use as part of Nextstrain's general subsampling approach, `augur subsample`.
We include an example tutorial to demonstrate the utility of this approach, selecting a small number of geographically-related samples as a mock outbreak and generating phylogenies which include the relevant contextual sequences for understanding the outbreak.


## Table of contents:
* Augur Proximity 
  * Proximal sampling via Augur Subsample
* Performance
  * SARS-CoV-2 
* Tutorial: North American 2025-26 Measles outbreak 
  * Prerequisites
  * Configuring the analysis
  * Running the analysis


# Augur Proximity

`augur proximity`, introduced in [Augur 33.1.0](https://github.com/nextstrain/augur/releases/tag/33.1.0), compares (a small set of) focal sequences against (a large set of) contextual sequences and returns the set of sequences closest to the focal set.
Closest here means Hamming distance, i.e. the number of nucleotide differences between two sequences.
In general, finding proximal sequences is quick but memory intensive, see "Performance" below.

There are three parameters you can use to configure how matches are found, see [the docs for full details](https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/proximity.html):
  1. How many closest neighbours to find for each focal sequence (`--k`, default 5)
  1. The maximum allowed Hamming distance for a match (`--max-distance`, default 4)
  1. How missing data (non-ATGC characters) should be considered (`--ignore-missing-data`).
     By default, a valid nucleotide in sequence A and missing data in sequence B would count as a difference.
     Choosing "all" would result in them being considered the same, while "flanking" would do the same only for runs of missing data at the start/end of each sequence.


While you can use the `augur proximity` command by itself we expect using its capabilities through `augur subsample` to be the most common use case.

## Proximal sampling via Augur Subsample

`augur subsample` uses a config YAML to define various samples which are combined together to produce the subsampled datasets; for instance one sample might filter the dataset by geographical region and time whilst a second sample chose 1000 recent samples from your country of interest.
An individual sample may represent a proximal sample, for instance finding the set of 1000 genomes which are closest to a small set of genomes of interest (e.g. newly collected outbreak samples).

See the [augur subsample docs](https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/subsample.html), and specifically the [proximal sample options available](https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/subsample.html#proximal-sample-options) for more.

> Note that sequences must be aligned to use `augur proximity` or proximal subsampling.
  We recommend using `nextclade` to align full datasets due to its speed.



---

# Performance


For most viral pathogens finding proximal sequences across all available data is feasible on a laptop (Figure 1).


<p/>
<div class='figure'>
<img src="/blog/img/proximity-pathogens.png" alt="runtime-memory-for-different-pathogens" />

**Figure 1.**
Runtime and memory usage for 3 viral pathogens, Zika, Influenza H3 (HA segment) and mpox, using all available data as the contextual set and randomly choosing 100 sequences as the focal set and running on 4 cores; all other parameters are default.
Each pathogen was run 3 times using a different focal set; memory usage is peak memory footprint as measured on MacOS.

</div>

Performance is mainly affected by the number of sequences involved (Figure 2). Peak memory usage is essentially determined by the number of contextual sequences x the sequence length (bp), and changes to sequence size (pink) or number of contextual sequences (purple) affect runtime and memory in a linear fashion.
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
(We don't think that exhaustively finding proximal sequences over the entire SARS-CoV-2 database is necessary or valid at the moment and thus haven't pursued these optimisations.)


If you do want to find proximal sequences for SARS-CoV-2 or similar sized datasets, we recommend first filtering the contextual sequences to a relevant set.
For instance, filtering contextual sequences to be the same Nextstrain clade via [augur filter](https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/filter.html), which is memory efficient for large datasets.
Figure 3 should help guide the number of contextual sequences your environment can handle.



<p/>
<div class='figure'>
<img src="/blog/img/proximity-ncov.png" alt="ncov-analyses" />

**Figure 3.**
Finding proximal sequences for nCoV is memory bound.
In our current implementation both runtime and memory scale linearly with the number of contextual sequences, making full analysis of SARS-CoV-2 genomes unfeasible as currently there are over 9M genomes available on GenBank.
Results of 5 replicates, using 16 cores on an AWS EC2 c7a.12xlarge instance and measuring maximum RSS memory usage.

</div>


---


# Tutorial: North American 2025-26 Measles outbreak


Our [nextstrain/measles](https://github.com/nextstrain/measles) pathogen repo currently runs three phylogenetic analyses: "N450/global", "genome/global" and "genome/north-america".
Within the repo is [an example of using proximal subsampling](https://github.com/nextstrain/measles/tree/proximal-subsampling/phylogenetic/custom-analyses/north-america-outbreak-example) which we will follow here.
It uses both open and [restricted Pathoplexus data](https://pathoplexus.org/about/terms-of-use/restricted-data) to focus on the Montana (USA) measles cases and place them in the context of the wider North American outbreak.

## Prerequisites

1. The nextstrain CLI (`nextstrain`) installed with a working runtime; minimum version: 10.0.0. See [Installing Nexstrain](https://docs.nextstrain.org/en/latest/install.html) for more details.
1. The latest version of the measles pathogen repo installed / updated, via `nextstrain setup measles` or `nextstrain update measles`.
1. Create an empty analysis directory to run the tutorial in. All commands below assume we are in this directory.
1. (Optional) This tutorial uses analysis directories separate to the pathogen repo itself; you may want to read [the nextstrain run documentation](https://docs.nextstrain.org/projects/cli/en/stable/commands/run/) for background context.


## Configuring the analysis

Two files are needed to customise the canonical measles workflow for this tutorial: `config.yaml` and `auspice_config.json`.
We can fetch them either by copying / downloading them from [GitHub](https://github.com/nextstrain/measles/tree/proximal-subsampling/phylogenetic/custom-analyses/north-america-outbreak-example) or via:

```sh
curl --compressed https://raw.githubusercontent.com/nextstrain/measles/refs/heads/main/phylogenetic/custom-analyses/north-america-outbreak-example/config.yaml -o config.yaml
curl --compressed https://raw.githubusercontent.com/nextstrain/measles/refs/heads/main/phylogenetic/custom-analyses/north-america-outbreak-example/auspice_config.json -o auspice_config.json
```

The most important of these is the `config.yaml`, which is [worth reading in full](https://github.com/nextstrain/measles/blob/proximal-subsampling/phylogenetic/custom-analyses/north-america-outbreak-example/config.yaml) to see how it configures the workflow.
We will focus on the subsampling configuration and walk through each of the four samples.


```yaml
subsample:
    genome/north-america-outbreak-example:
        samples:
            genotype-d8:
                exclude_where:
                    - "genotype_ppx!=D8"
                exclude: dropped_strains.txt
                drop_sample: true
            background:
                context_sample: genotype-d8
                max_sequences: 500
                group_by:
                    - region
                    - year
            montana-outbreak:
                context_sample: genotype-d8
                min_date: "2025-01-01"
                exclude_where:
                    - "division!=Montana"
            nearest-strains:
                method: hamming
                focal_sample: montana-outbreak
                context_sample: genotype-d8
                k: 20
                ignore_missing_data: all
```


The first sample "genotype-d8" filters the entire dataset to the D8 genotype [which is the genotype involved in the North American outbreak](https://next.nextstrain.org/measles/genome); it has the `drop_sample` flag set, indicating it doesn't itself become part of the output but is used by other samples.


The second sample "background" is a common sampling approach in our workflows, here we group the sequences in the "genotype-d8" sample by geographic region & year and randomly sample up to 500. (In this case, because the distribution of samples across region & year is very unequal we sample far less than 500.)


The third sample "montana-outbreak" isolates all the D8 Montana samples from 2025/26.
These will be used as the focal set for our use of proximal sampling in order to understand this states samples in a wider context; this approach may mirror what a state's Departments of Health would do for routine surveillance.
How you choose your focal set is dependent on the research question - another common approach would be to merge private data with publicly available data as part of the workflow and then have the private data be your focal set.
As of July 2026, this focal set has 12 genomes.


The fourth sample "nearest-strains" is the one which uses [proximal sample options](https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/subsample.html#proximal-sample-options) to find the 20 closest sequences for each of the focal strains across all available D8 genotype samples. Note that this doesn't mean we'll find 20 sequences for each focal one: there may be overlap (e.g. the same sample is close to multiple montana samples) - which is common in outbreaks, and there may not be 20 samples which meet the maximum-distance threshold (here not specified, so using the default of 4).


Augur subsample will then merge all samples together except those we instructed it to drop, meaning our analysis will consist of background sequences, the small set of samples from Montana, and the genetically closest samples to those.
The final dataset size is only 194 genomes - deliberately small to explore the advantages that proximal sampling can provide.



## Running the analysis

With the two configuration files in your (otherwise empty) analysis directory, we can run the tutorial via:

```sh
nextstrain run measles phylogenetic .
```

When completed, the analysis is available in the `auspice/` directory.
You can either drag these JSONs onto [auspice.us](https://auspice.us) or use `nextstrain view auspice` to open a browser tab.
You should see a tree similar to Figure 4.

<p/>
<div class='figure'>
<img src="/blog/img/proximity-tutorial-tree.png" alt="ncov-analyses" />

**Figure 4.**
The phylogenetic tree produced by this tutorial. Montana samples (i.e. those from the "montana-outbreak" yaml config block) are highlighted.

</div>

Comparing the small tutorial tree with only 136 North American genomes vs our current full North American dataset (Figure 5A) shows that while we have far fewer samples we accurately capture the surrounding context for Montana samples (Figure 5B).
(In reality, 136 samples is tiny, and usages beyond an example tutorial should use denser sampling.)


<p/>
<div class='figure'>
<img src="/blog/img/proximity-tutorial-tangle.png" alt="subsampled-tree-vs-full-tree" />

**Figure 5.**
(**A**) Zoomed in view of the tutorial tree's n=136 North American genomes (LHS) vs a more comprehensive analysis showing n=1992 North American D8 genomes (RHS); horizontal axis represents time.
The full tree is the measles workflow's "genome/north-america" build.
(**B**) Zoomed in view into a part of the trees with a Montana sample (highlighted in pink boxes).
Horizontal axis here represents divergence.

</div>
