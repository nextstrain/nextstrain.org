---
author: "Trevor Bedford, Richard Neher and the Nextstrain team"
date: "2025-11-06"
title: "Interruption to GISAID-based SARS-CoV-2 sequence analyses"
sidebarTitle: "Interruption to GISAID-based SARS-CoV-2 analyses"
---

On Oct 1, 2025, we received an email from GISAID Secretariat informing us that GISAID has immediately ended updates to the flat file of SARS-CoV-2 genomic sequences and associated metadata that they had provisioned to Trevor Bedford for updating Nextstrain analyses since Feb 2020.
GISAID's stated rationale was that their "resources are limited".

This file was initially provisioned Jan 30 2020, and we had kept [nextstrain.org/ncov](https://nextstrain.org/ncov@2020-01-30) updated from it to show the genetic relationships among all SARS-CoV-2 viruses sequenced and shared to GISAID.
As the dataset grew, we developed a subsampling strategy that faceted the data by different continent-level regions, by different recency windows (ie 2 months back, 6 months back or the entire timeseries) and by different rootings (ie to Wuhan or to clade 21L).
On GISAID's request, we made specific changes to the website to do things like surface GISAID's logo at the top of the page, to keep the hCoV-19/ prefix in strain names and to disable download of associated metadata.
We also arranged with GISAID for them to host matching sequence and metadata files because we're not permitted to reshare GISAID data under their [Database Access Agreement](https://gisaid.org/terms-of-use/).
Starting May 2020, these were available through the ["nextregion" section](https://docs.nextstrain.org/projects/ncov/en/v9/analysis/data-prep.html#download-contextual-data-for-your-region-of-interest) of "Genomic Epidemiology" in their EpiCoV interface.

More precisely, in ending updates to our flat file, GISAID stated that our 'nextregion' package was not being downloaded with a "frequency that justifies the effort required by GISAID to package and prepare the information".
Our belief is that the primary public health utility and original purpose of the data feed from Jan 2020 was to enable continued updates to nextstrain.org/ncov, which still sees significant daily visitors.
Making metadata and sequences available through the "nextregion" interface was a secondary byproduct enacted in May 2020 to allow reproducible research given strictures of GISAID's data resharing policy.

In October's email exchange, we requested continued flat file access to keep nextstrain.org/ncov updated, but GISAID has refused this request stating that "after consulting with our staff and advisors on the feasibility of keeping your global tree up-to-date, there was a clear consensus that continuing to generate, zip and move big files back and forth is not sustainable and a waste of resources."
This has not made sense to us as GISAID can keep a single flat file up-to-date and available across analysis websites including [LANL](https://cov.lanl.gov/content/index), [CoV-Spectrum](https://cov-spectrum.org/), Nextstrain, etc...
There are also simple technical revisions (for example sharding by submission year) that would easily reduce resource overhead in generating this single file for use across external analysis websites.

Instead GISAID has proposed that we "provide to GISAID the parameters for Augur and GISAID will run it for you. You would then be provided the Augur output JSON file with the relevant subsample for your phylogenetic tree."
However, our analyses pipelines are developed continuously and we don't think this proposal is a viable or desirable solution.
We believe that continued flat-file access is the appropriate modality and easiest way forward to keep genomic surveillance operating.
Additionally, we think it is important to keep a bright line between analyses run by Nextstrain and those run by others.
That said, we're open to finding a solution that would respect this, with a conceivable option of GISAID produced JSONs shared directly by GISAID through a new [Groups page](https://docs.nextstrain.org/en/latest/learn/groups/).
We don't have a timeline or details on continued GISAID-based analyses at the moment.

We firmly support labs collecting specimens and generating sequence data and strive to credit these labs prominently.
But credit for data contributions does not need to be a zero sum game – appropriate surfacing of data in popular tools generates visibility and recognition and does not infringe on future publications by the data generators.
Real-time genomic surveillance including early variant warning requires a healthy analysis ecosystem.
Tools like Nextstrain, [CoV-Spectrum](https://cov-spectrum.org/), [UShER](https://genome.ucsc.edu/cgi-bin/hgPhyloPlace) and [outbreak.info](https://outbreak.info/) facilitate a global community of experts to keep close tabs on the ongoing evolution of SARS-CoV-2.
Support for Outbreak.info ended in [Jan 2025](https://bsky.app/profile/kgandersen.bsky.social/post/3lqbcqxxyss2l) and CoV-Spectrum hasn't been updated for >3 weeks.
Closing these public analyses puts the world more in the dark and concretely harms surveillance as it becomes more difficult for variant spotters to contribute to [global](https://x.com/siamosolocani/status/1983854434988769597) [situational](https://x.com/JPWeiland/status/1984030560801714217) [awareness](https://www.thinkglobalhealth.org/article/to-finish-the-pandemic-agreement-who-needs-a-trustworthy-viral-database).
Ending flat-file access undermines vital surveillance infrastructure and conflicts with GISAID's [mission](https://gisaid.org/about-us/mission/) to promote rapid data sharing and develop new research tools.

Our [open analyses](https://nextstrain.org/pathogens?filter=ncov&filter=open) based on GenBank / INSDC data continue to operate as usual.
There is a fair amount of recent data here, but it is geographically restricted as many countries submit primarily to GISAID.
If you're interested to see your data in these open analyses please consider submitting sequences to INSDC via the [NCBI SARS-CoV-2 submission portal](https://submit.ncbi.nlm.nih.gov/sarscov2/).

_We believe transparency is essential in these matters of global genomic surveillance._
_As such, we requested a fact check from GISAID prior to publication of this blog post._
_Our queries, GISAID's verbatim responses and our clarifications are [available in this PDF document](https://data.nextstrain.org/files/blog/2025-11-06_gisaid_fact_check.pdf)._
