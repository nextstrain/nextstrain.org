---
title: Seasonal influenza A/H3N2 circulation patterns and projections (Feb 2018 to Feb 2019)
---

`nextstrain url=flu?d=tree&p=full&c=num_date`
## Summary

* The data here are based off a report detailing current seasonal influenza circulation patterns as of Feb 2018 and making
projections up to Feb 2019 to coincide with selection of the 2018-2019 Northern Hemisphere vaccine
strain.
* The data show 1882 genomes collected between 2012 and 2018 from 113 countries. The data have been subsampled in an attempt to minimise geographic and temporal sampling biases.


`nextstrain url=flu/h3n2/ha/3y?d=tree&dmax=2016-11-09&p=full&c=clade_membership`
## The situation a year ago
A number of clades were vying for dominance.


From top to bottom:
* A1 & A1a
* A2
* A3
* A4


`nextstrain url=flu/h3n2/ha/3y?d=tree&dmax=2017-01-09&p=full&s=A/HongKong/4801/2014-egg`
## Last year's vaccine strain
* A/Hong Kong/4801/2014 (i.e. from 2014)

`nextstrain url=flu/h3n2/ha/3y?d=tree&dmax=2017-01-09&p=full&c=cTiter`
## Coloring by titer shows that there were no drastic titer drops
* Titers show how successfully serum raised from one virus neutralises another, and can be used as a proxy for immune response.
* In this case, the serum can be thought of as the root of the tree (roughly similar to last year's vaccine strain)
* Cooler colors show good responses, whereas warmer colors are indicative of poor protection (_in vitro_)
* Very few viruses have log-titer drops over 0.5, indicating that the virus strain _should_ have provided relatively good protection.


`nextstrain url=flu/h3n2/ha/3y?c=clade_membership&d=tree&dmax=2018-02-14&dmin=2017-01-20&p=full`
## Looking at strains collected over the past year
* We can see that most of the clades present last year are still present.
* Basal A1 clade seems to have mostly died out, but descendant clades A1a & A1b are present and seem to be growing.


`nextstrain url=flu/h3n2/ha/3y?c=cTiter&d=tree&dmax=2018-02-14&dmin=2017-01-20&p=full`
## Titers are beginning to drop
Coloring the tree by titer (again, relative to the root of the tree), we are starting to see reduced reactivity amoungst the tips of the tree.

* This is especially pronounced in a subclade of A4 (potentially due to a HA2:V200I mutation), as well as in A1b.


`nextstrain url=flu/h3n2/ha/3y?c=lbi&d=tree&dmax=2018-02-14&dmin=2017-01-20&p=full`
## Local Branching Index (LBI) indicates A1b and A2 as the fastest growing clades
* LBI is a measure of how quickly branching is occurring in a neighborhood of the tree [Neher et al., eLife 2014](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4227306/)
* Warmer colours indicate more rapid branching.
* LBI signals out clades A1b and A2 as the fastest growing clades.

`nextstrain url=flu/h3n2/ha/3y?c=clade_membership&d=tree,frequencies&dmax=2018-02-14&dmin=2017-01-20&p=full`
## Using a predictive frequency model
Modelling work by [John Huddlestone](twitter.com/jlhudd), [Trevor Bedford](twitter.com/trvrb) and [Richard Neher](twitter.com/rneher) can estimate the underlying prevalence of traits (e.g. clades).


These data can be displayed as a stream graph showing how the proportions of each clade over time.


We can ask how the clade compositions differ between geographical regions.


`nextstrain url=flu/h3n2/ha/3y?d=tree,frequencies&dmax=2018-02-14&dmin=2017-01-20&f_region=north_america&p=full`
## Clade A2 dominates in North America

Restricting the data to only those samples which come from North America, we can see that clade A2 clearly dominates.



`nextstrain url=flu/h3n2/ha/3y?d=tree,frequencies&dmax=2018-02-14&dmin=2017-01-20&f_region=china,japan_korea,south_asia,southeast_asia,west_asia&p=full`
## Both A2 and A1b are vying for dominance in Asia

Contrary to the North American situation, both A1b and A2 are present in Asia at roughly equal proportions. Given that Asia is frequently the source of seasonal flu, this makes it hard to conclusively pick A2 as the winner - especially as A1b showed more signs of antigenic drift.


`nextstrain url=flu/h3n2/ha/3y?d=tree&p=full&c=clade_membership`
## Our predictions

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Based on growth rates we&#39;d project A2 viruses as being predominant in a year, while based on antigenic drift we&#39;d project A1b viruses. Overall, we project a mixture of A2 and A1b in the future population. 6/6 <a href="https://t.co/1cGdPxj8G2">pic.twitter.com/1cGdPxj8G2</a></p>&mdash; Trevor Bedford (@trvrb) <a href="https://twitter.com/trvrb/status/967070301484867584?ref_src=twsrc%5Etfw">February 23, 2018</a></blockquote>

`nextstrain url=flu/h3n2/ha/3y?d=tree&p=full&s=A/Singapore/Infimh-16-0019/2016-egg&c=clade_membership`
## Flu vaccine choice for next year

The A/Singapore/INFIMH-16-0019/2016 strain has been chosen as the H3N2 component for next year's Northern Hemisphere flu vaccine (WHO, 22 Feb 2018).
This is the same strain as that used in this year's Southern Hemisphere vaccine.
