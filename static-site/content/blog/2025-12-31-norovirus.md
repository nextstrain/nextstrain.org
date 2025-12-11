---
author: "Jennifer Chang, Jover Lee, Kim Andrews, Allison Li, Katie Kistler, John Huddleston, Trevor Bedford"
date: "2025-12-31"
title: "New Resources for Norovirus"
sidebarTitle: "Norovirus resources"
---

Historically called "winter vomiting disease" ([Adler and Zickl, 1969](https://doi.org/10.1093/infdis/119.6.668)), norovirus is the bane of any parent, long term care facility, or otherwise contained community. The name of the virus is a mangled reference to Norwalk, Ohio, where a particular 1968 outbreak surged through a population of school children within a 24 hour period. Despite its explosive symptomology, the etiological agent was not identified as a virus until 1972, by immune electron microscopy ([Kapikan et al, 1972](https://doi.org/10.1128/jvi.10.5.1075-1081.1972)) and not genetically sequenced until 1989 ([Jiang et al, 1993](https://doi.org/10.1006/viro.1993.1345)). The subsequent classification of the virus was fraught as it became clear that the virus undergoes recombination, frequently between the ORF1 and ORF2 region ([Bull et al, 2005](https://doi.org/10.3201/eid1107.041273)), resulting in different evolutionary histories between the polymerase (RdRp in ORF1) and surface capsid (VP1 in ORF2). Despite multiple attempts and discomfiture among those afflicted, there is no approved norovirus vaccine.

## Phylogenetic analysis

Nextstrain provides regularly updated phylogenetic monitoring of norovirus along several different facets. Since this is a highly recombining virus, we provide individual gene trees as well as the full genome tree of all norovirus samples, building off the prior effort of Allison Li and Katie Kistler and John Huddleston. They have also faceted the genome trees along important VP1 genogroups GII.2, GII.3, GII.4, GII.6 and GII.17. Therefore, as of the time of this writing, we provide 14 regularly updated views of norovirus evolution. We welcome feedback or requests if other groups or combinations are useful to the field.

We maintain **14 views** of norovirus evolution:

| group | genome | p48 | NTPase | p22 | VPg | 3CLpro | RdRp | VP1 | VP2 |
|:--|:--|:--|:--|:--|:--|:--|:--|:--|:--|
| all | [genome](https://nextstrain.org/norovirus/all/genome) | [p48](https://nextstrain.org/norovirus/all/p48) | [NTPase](https://nextstrain.org/norovirus/all/NTPase) | [p22](https://nextstrain.org/norovirus/all/p22) | [VPg](https://nextstrain.org/norovirus/all/VPg) | [3CLpro](https://nextstrain.org/norovirus/all/3CLpro) | [RdRp](https://nextstrain.org/norovirus/all/RdRp/) | [VP1](https://nextstrain.org/norovirus/all/VP1) | [VP2](https://nextstrain.org/norovirus/all/VP2) |
| GII.2 | [genome](https://nextstrain.org/norovirus/GII.2/genome) | | | | | | | | |
| GII.3 | [genome](https://nextstrain.org/norovirus/GII.3/genome) | | | | | | | | |
| GII.4 | [genome](https://nextstrain.org/norovirus/GII.4/genome) | | | | | | | | |
| GII.6 | [genome](https://nextstrain.org/norovirus/GII.6/genome) | | | | | | | | |
| GII.17 | [genome](https://nextstrain.org/norovirus/GII.17/genome) | | | | | | | | |

 The combination of highly diverged and recombined sequences proved a challenge in rooting the phylogenetic trees, and **we advise that any results should be interpreted with caution**. Even so, the Nextstrain trees are provided as a broad summary of the genetic diversity and relatedness, and further biological interpretation may require targeted sampling, tuning of parameters, a different alignment reference, or focusing on particular gene combinations. The trees are being annotated by both VP1 and RdRp types. From the map, genotypes do not appear to be geographically segregated. From the frequency panel, we see indications that there are dynamics of leading types and it is not a virus that has reached genetic equilibrium of the proportion of those types.

![Figure 1](/blog/img/norovirus-all-genome-view.png)
**Figure 1. Norovirus is globally distributed and highly divergent.** Phylogenetic trees are annotated by both VP1 and RdRp types, host, country, date, genome and gene coverage percentages. The full genome tree shown here. From the map, genotypes do not appear to be geographically segregated. From the frequency panel, we see indications that there are dynamics of leading types and it is not a virus that has reached genetic equilibrium of the proportion of those types.

## Norovirus groups, types, and variants

Norovirus samples have a duel-typing system based on a polymerase region (RdRp) and capsid region (VP1) of the genome, between which is a known recombination site. The resolution of norovirus typing has undergone multiple changes ([Zheng et al., 2006](https://doi.org/10.1016/j.virol.2005.11.015); [Eden et al., 2013](https://doi.org/10.1128/jvi.03464-12); [Chhabra et al., 2019](https://doi.org/10.1099/jgv.0.001318); [Tatusov et al., 2020](https://doi.org/10.1016/j.jcv.2020.104718)), but generally are split into a "genogroup", "genotype", and "variant" classification for VP1 (and "P-group", "P-type", and "variant" for RdRp).

![Figure 2](/blog/img/norovirus-group-type-variant.png)
**Figure 2. Typing of norovirus samples is based on the VP1 and RdRp region** and are further split out into group, type, and variant resolution.

We provide 2 Nextclade datasets (either VP1 or RdRp) which each provide group, type, and variant levels of resolution for clade coloring. The Norovirus nextclade datasets are preliminary and can use further development depending on future funding or priorities. Scaffold strains for the norovirus lineage systems are consistently updated at https://calicivirustypingtool.cdc.gov/becerance.cgi and these Nextclade datasets were built with the version available on September 16, 2025.

| Scope | Draft nextclade dataset | Scaffold tree |Reference |
|:--|:--|:--|:--|
| VP1  | [norovirus/VP1][] | [scaffold tree for VP1][]| [MK073894][] (GII.4)|
| RdRp | [norovirus/RdRp][] | [scaffold tree for RdRp][]| [MK073894][] (GII.4)|

![Figure 3](/blog/img/norovirus-nextclade-results.png)
**Figure 3. Typing of norovirus samples is based on the VP1 and RdRp region** and are further split out into group, type, and variant resolution.

## Nextstrain resources

We curate sequence data and metadata from NCBI as the starting point
for our analyses. Curated sequences and metadata are available as flat
files at:

* [data.nextstrain.org/files/workflows/norovirus/metadata.tsv.zst](https://data.nextstrain.org/files/workflows/norovirus/metadata.tsv.zst)
* [data.nextstrain.org/files/workflows/norovirus/sequences.fasta.zst](https://data.nextstrain.org/files/workflows/norovirus/sequences.fasta.zst)

## Acknowledgments & request for comments

We welcome comments or suggestions from norovirus researchers to improve these Nextstrain and Nextclade datasets. Special thanks for feedback from Chao-Yang Pan and Erik Wolfsohn for answering questions and providing some biological context.

[nextstrain.org/norovirus]: https://nextstrain.org/norovirus
[nextstrain.org/norovirus/all/genome]: https://nextstrain.org/norovirus/all/genome
[norovirus/VP1]: https://clades.nextstrain.org/?dataset-url=https://github.com/nextstrain/norovirus/tree/main/nextclade_data/VP1
[norovirus/RdRp]: https://clades.nextstrain.org/?dataset-url=https://github.com/nextstrain/norovirus/tree/main/nextclade_data/RdRp
[scaffold tree for VP1]: https://next.nextstrain.org/fetch/raw.githubusercontent.com/nextstrain/norovirus/main/nextclade_data/VP1/tree.json?d=tree&p=full
[scaffold tree for RdRp]: https://next.nextstrain.org/fetch/raw.githubusercontent.com/nextstrain/norovirus/main/nextclade_data/RdRp/tree.json?d=tree&p=full
[MK073894]: https://www.ncbi.nlm.nih.gov/nuccore/MK073894
