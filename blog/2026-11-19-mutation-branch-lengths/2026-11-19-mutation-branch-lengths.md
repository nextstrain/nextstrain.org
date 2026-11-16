---
title: Branch lengths representing mutations per-gene
date: "2026-11-19"
authors:
  - name: "James Hadfield"
  - name: "The Nextstrain Team"
  - name: "John Huddleston"
pdf-download: false
---


Phylogenetic trees in Auspice have always had the unique ability to interactively transition between showing branch lengths of "div" (divergence) or "time", with temporal branch lengths typically inferred using TimeTree [@treetime].
We now allow dynamic rescaling of branch lengths based on counting mutations in any selected CDS (gene), or counting nucleotides across the entire genome.

To demonstrate this we'll use our ongoing analysis of the cattle-flu (A/H5N1) outbreak in North America.
This is a genome build, where we've concatenated all 8 influenza segments together to improve the phylogenetic resolution, leveraging GenoFLU constellations to select non-reassorting samples [^genoflu].
By default branch lengths represent 
:trigger[time]{target=fig:cattle-flu update='{"distanceMeasure": "time"}'},
however you can now also switch to
:trigger[div (genome)]{target=fig:cattle-flu update='{"distanceMeasure": "div"}'},
as well as amino-acid mutations for
:trigger[HA]{target=fig:cattle-flu update='{"distanceMeasure": "mutationCount:HA"}'},
:trigger[M1]{target=fig:cattle-flu update='{"distanceMeasure": "mutationCount:M1"}'},
:trigger[M2]{target=fig:cattle-flu update='{"distanceMeasure": "mutationCount:M2"}'},
:trigger[NA]{target=fig:cattle-flu update='{"distanceMeasure": "mutationCount:NA"}'},
:trigger[NP]{target=fig:cattle-flu update='{"distanceMeasure": "mutationCount:NP"}'},
:trigger[NS1]{target=fig:cattle-flu update='{"distanceMeasure": "mutationCount:NS1"}'},
:trigger[NS2]{target=fig:cattle-flu update='{"distanceMeasure": "mutationCount:NS2"}'},
:trigger[PA]{target=fig:cattle-flu update='{"distanceMeasure": "mutationCount:PA"}'},
:trigger[PB1]{target=fig:cattle-flu update='{"distanceMeasure": "mutationCount:PB1"}'} and
:trigger[PB2]{target=fig:cattle-flu update='{"distanceMeasure": "mutationCount:PB2"}'}


> Click the above buttons to update the figure with those branch lengths


:::figure{#fig:cattle-flu max-width=66vw}
```yaml gazette
component: auspice.js
standalone: true
data:
  main: https://nextstrain.org/avian-flu/h5n1-cattle-outbreak/genome@2026-11-16
opts:
  panels: ["tree"]
  query: '?c=division'
  heightMultiplier: 1
```
**Nextstrain's full-genome cattle-flu dataset**
Interactive figure of [avian-flu/h5n1-cattle-outbreak/genome](https://nextstrain.org/avian-flu/h5n1-cattle-outbreak/genome@2026-11-16?c=division) as of 2026-11-16 with 5,673 North American Influenza A/H5N1 B3.13 samples. 
Segments have been concatenated together to increase resolution.
Colours represent inferred State, with opacity used to encode our confidence in these reconstructions (hover over tips/branches for more details).
:::


# Seasonal-flu scatter pre-post pandemic

A 12-year analysis of seasonal-flu A/H3N2's HA segment shows interesting pre- and post-pandemic dynamics in the overall evolution of the HA1 gene subunit (329 amino acids long). 
By filtering the samples to 
:trigger[pre-2020]{target=fig:seasonal-flu-12y update='{"dateMin":null, "dateMax":"2020-01-01", "showRegression": true}'}
and
:trigger[post-2020]{target=fig:seasonal-flu-12y update='{"dateMin":2020-01-01, "dateMax":null, "showRegression": true}'}
we see an increased rate of AA evolution, with 2.1 vs 3.3 amino acid changes per year.
(:trigger[Reset figure]{target=fig:seasonal-flu-12y update='{"dateMin":null, "dateMax":null, "showRegression": false}'}.)


:::figure{#fig:seasonal-flu-12y max-width=70vw}
```yaml gazette
component: auspice.js
standalone: true
data:
  main: https://nextstrain.org/seasonal-flu/h3n2/ha/12y@2026-11-16
opts:
  panels: ["tree"]
  query: '?l=scatter&scatterY=mutationCount:HA1&c=clade_membership&branchLabel=none'
  heightMultiplier: 0.8
```
Nextstrain's [12y H3N2/HA phylogeny as of 2026-11-16](https://nextstrain.org/seasonal-flu/h3n2/ha/12y@2026-11-16).
Scatterplot shows inferred sampling time against accumulated count of HA1 mutations.
Colour represents clade and the legend can be toggled via the arrow in the top left. 
:::




[^genoflu]: See the [avian-flu README](https://github.com/nextstrain/avian-flu#genome-focused-builds-from-ncbi-data) for more details on how we select B3.13 strains.
