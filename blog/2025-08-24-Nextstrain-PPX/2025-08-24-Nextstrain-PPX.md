---
author: Nextstrain team
date: "2025-08-28"
title: "Using Pathoplexus as data source for Nextstrain builds"
sidebarTitle: "PPX and Nextstrain"
---

[Pathoplexus](https://pathoplexus.org) (PPX) is a new database for timely sharing of viral sequence data that was launched one year ago (disclosure: some of us at Nextstrain are involved in Pathoplexus).
The goal of Pathoplexus is to facilitate sharing of virus genomes, in a way that ensures that those involved in collecting the samples and generating the sequences get the recognition they deserve, while maximizing the utility of the data to advance public health.
Sharing data via PPX is very easy, and submitters can choose to share their data either as "OPEN" or as "RESTRICTED" use.
Open sequences are submitted to INSDC (ENA/NCBI/DDBJ) immediately, while restricted use data are made available for public health and surveillance purposes right away on Pathoplexus, while publishing using these data is generally prohibited for up to one year (see [Data use terms](https://pathoplexus.org/about/terms-of-use/data-use-terms) for details).

Pathoplexus provides a modern API to the data, meaning that it is straightforward and fast to retrieve (and submit) data in an automated way.
Nextstrain has started using Pathoplexus as the data source for [our automatically updated analyses of RSV](https://nextstrain.org/rsv/a/genome/6y).
The information on each sample in our trees now includes links to these samples on Pathoplexus and an explicit statement on the data use terms associated with this sample, along with a link to the data use terms on Pathoplexus -- as is required by the Pathoplexus data use terms.

![tooltip](/blog/img/ppx_tip_tooltip.png)

The files containing the curated metadata and the sequences that we reshare on [Nextstrain](https://nextstrain.org/rsv/a/genome/6y) contain the subset of the data that is available under 'OPEN' data use terms, which in most cases is going to be the same as data available in NCBI virus (synchronization delays can lead to small, temporary differences).
The metadata table contains additional columns linking back to the data source on Pathoplexus and the Pathoplexus accessions.
For the time being, we advise users interested in Restricted-Use data to obtain these from Pathoplexus directly and to carefully consult the [data use terms](https://pathoplexus.org/about/terms-of-use/data-use-terms).

We are excited about the new ways of sharing pathogen sequence data that Pathoplexus provides and are looking into using Pathoplexus as data source for other analyses such as mpox or metapneumovirus.






