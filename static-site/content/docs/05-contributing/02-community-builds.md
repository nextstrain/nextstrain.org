---
title: "Community Sharing of Results Via GitHub"
---

We want Nextstrain to be a community-driven platform, to share datasets with collaborators and the world.
While you can install `augur` and `auspice` locally to analyse and interact with datasets, we wanted a way to share these with the world -- without having to lose control of your data.

Our solution to this is to allow anyone to store the results of their analyses on [GitHub](https://github.com) but still analyse them through [nextstrain.org](https://nextstrain.org). This gives you complete control, ownership, and discretion over your data.


### How Does This Actually Work?
* Run your analysis locally ([see the bioinformatics introduction](/docs/bioinformatics/introduction-to-augur))
* Create a GitHub repository for your analysis. For instance, [Alli Black](https://bedford.io/team/allison-black/) has created a "zika-colombia" in the "blab" group/organisation/username -- [github.com/blab/zika-colombia](https://github.com/blab/zika-colombia)
  * _This is your own github repository -- you don't even need to tell us about it if you don't want to!_
* Make sure the JSONs you've produced start with the same name as the repository. In this case they'd need to be `zika-colombia_meta.json` and `zika-colombia_tree.json`
* Store your final output from augur, i.e. the JSONs which auspice uses, in a directory called "auspice" -- [see here for an example](https://github.com/blab/zika-colombia/tree/master/auspice)
  * While you don't need to, it'd be great if you also stored your analysis pipeline (e.g. Snakefile) on GitHub too! This doesn't need to give away any data, just the recipe for the analysis.
* Push things to github.
* Access your data via "nextstrain.org/community" + "github organisation name" + "github repo name". For this example, it's at [nextstrain.org/community/blab/zika-colombia](/community/blab/zika-colombia).
  * Share your results with the world 🎉🎉

### Some Examples

* Genomic epidemiology of the 2018 North Kivu, DRC Ebola epidemic: [GitHub](https://github.com/inrb-drc/ebola-nord-kivu) & [Nextstrain](/community/inrb-drc/ebola-nord-kivu)
* Wheat yellow rust fungus -- the first plant pathogen on nextstrain 🎉 [GitHub](https://github.com/saunderslab/PST) & [Nextstrain](/community/saunderslab/PST)
* Zika in Columbia: [GitHub](https://github.com/blab/zika-colombia) & [Nextstrain](/community/blab/zika-colombia)
* TB outbreak in Germany: [GitHub](https://github.com/idolawoye/tb) & [Nextstrain #1](/community/idolawoye/tb/1), [Nextstrain #2](/community/idolawoye/tb/2)
* Lassa virus evolution 2015-2018 Outbreak in Nigeria: [GitHub](https://github.com/pauloluniyi/lassa) & [Nextstrain (L segment)](/community/pauloluniyi/lassa/l), [Nextstrain (S segment)](/community/pauloluniyi/lassa/s)
