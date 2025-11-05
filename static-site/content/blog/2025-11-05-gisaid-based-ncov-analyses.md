---
author: "Trevor Bedford, Richard Neher and the Nextstrain team"
date: "2025-11-05"
title: "Interruption to GISAID-based SARS-CoV-2 sequence analyses"
sidebarTitle: "Interruption to GISAID-based SARS-CoV-2 analyses"
---

On Oct 1, 2025, we received an email from GISAID Secretariat informing us that GISAID has immediately ended updates to the flat file of SARS-CoV-2 genomic sequences and associated metadata that they had provisioned to Nextstrain since Feb 2020.
The stated rationale was that their "resources are limited".

In early 2020, we kept [nextstrain.org/ncov](https://nextstrain.org/ncov/open/global/6m@2020-02-15) updated from this kindly provisioned flat file to show the genetic relationships among all SARS-CoV-2 viruses sequenced and shared to GISAID.
As the dataset grew, we developed a subsampling strategy that faceted the data by different continent-level regions, by different recency windows (ie 2 months back, 6 months back or the entire timeseries) and by different rootings (ie to Wuhan or to clade 21L).
On GISAID's request, we made specific changes to the website to do things like surface GISAID's logo at the top of the page, to keep the hCoV-19/ prefix in strain names and to disable download of associated metadata.
We also arranged with GISAID for them to host matching sequence and metadata files because we're not permitted to reshare GISAID data under their [Database Access Agreement](https://gisaid.org/terms-of-use/).
These were available through the "nextregion" section of "Genomic Epidemiology" in their EpiCoV interface.

In October's email exchange, we requested continued flat file access to keep nextstrain.org/ncov updated, but GISAID has refused this request stating that "after consulting with our staff and advisors on the feasibility of keeping your global tree up-to-date, there was a clear consensus that continuing to generate, zip and move big files back and forth is not sustainable and a waste of resources."
This has not made sense to us as GISAID is already keeping exactly this file up-to-date and available for other analysis websites like [LANL](https://cov.lanl.gov/content/index).
We believe that parity access to the same non-Nextstrain-specific flat files provided to other external platforms should not represent additional resources required from GISAID.

Instead GISAID has proposed that we "provide to GISAID the parameters for Augur and GISAID will run it for you. You would then be provided the Augur output JSON file with the relevant subsample for your phylogenetic tree." However, our analyses pipelines are developed continuously and we don't think this proposal is a viable or desirable solution.
We believe that continued flat-file access is the appropriate modality and easiest way forward to keep genomic surveillance operating.
Additionally, we think it is important to keep a bright line between analyses run by Nextstrain and those run by others.
That said, we're open to finding a solution that would respect this, with a conceivable option of GISAID produced JSONs shared directly by GISAID through a new [Groups page](https://docs.nextstrain.org/en/latest/learn/groups/).
We don't have a timeline or details on continued GISAID-based analyses at the moment.

We firmly support labs collecting specimens and generating sequence data and strive to credit these labs prominently.
But credit for data contributions does not need to be a zero sum game – appropriate surfacing of data in popular tools generates visibility and recognition and does not infringe on future publications by the data generators.
Real-time genomic surveillance including early variant warning requires a healthy analysis ecosystem.
Tools like Nextstrain, [CoV-Spectrum](https://cov-spectrum.org/), [UShER](https://genome.ucsc.edu/cgi-bin/hgPhyloPlace) and [outbreak.info](https://outbreak.info/) facilitate a global community of experts to keep close tabs on the ongoing evolution of SARS-CoV-2.
Support for Outbreak.info ended in [May 2025](https://bsky.app/profile/kgandersen.bsky.social/post/3lqbcqxxyss2l) and CoV-Spectrum hasn't been updated for 3 weeks.
Closing these public analyses puts the world more in the dark and concretely harms surveillance as it becomes more difficult for variant spotters to contribute to [global](https://x.com/siamosolocani/status/1983854434988769597) [situational awareness](https://x.com/JPWeiland/status/1984030560801714217).

Our [open analyses](https://nextstrain.org/pathogens?filter=ncov&filter=open) based on GenBank / INSDC data continue to operate as usual.
There is a fair amount of recent data here, but it is geographically restricted as many countries submit primarily to GISAID.
If you're interested to see your data in these open analyses please consider submitting sequences to INSDC via the [NCBI SARS-CoV-2 submission portal](https://submit.ncbi.nlm.nih.gov/sarscov2/).
