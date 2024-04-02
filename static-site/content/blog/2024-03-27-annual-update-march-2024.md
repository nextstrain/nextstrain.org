---
author: "Nextstrain team"
date: "2024-03-27"
title: "Nextstrain Annual Update March 2024"
---

_The nextstrain.org blog has not seen a lot of use lately. Here we're piloting an effort to post annual updates._

Following initial intensive COVID-19 pandemic response in 2020 to 2022, we have returned to a baseline of tracking various pathogens, software development and user support. After a peak during the pandemic with high traffic volume and a large number of user interactions, we have entered a fairly steady period with about 5-10 fold more visitors to nextstrain.org than pre-pandemic. Overall, this is a level we are comfortable with and we are looking into ways to sustainably build on the status quo and further develop Nextstrain in ways that serve the public health and pathogen genomics communities best.

Our central conceit has two pillars:
1. _Routine real-time genomic surveillance across a variety of circulating pathogens_
2. _Rapid pivots to emerging public health threats_

as we believe that proper tooling for real-time surveillance (1) enables rapid response when new threats emerge (2).

## Current composition of the core team

As open source software, we have contributions to the codebase from unaffiliated individuals, but Nextstrain is largely a product of a [core developer team](https://nextstrain.org/team/) consisting of lab members of the Bedford Lab at the Fred Hutchinson Cancer Center in Seattle and the Neher Lab at the University of Basel. Seattle members include Kim Andrews (bioinformatician), Jennifer Chang (bioinformatician), James Hadfield (consultant), John Huddleston (staff scientist), Jover Lee (software developer), Victor Lin (software developer) and Tom Sibley (software developer). Basel members include Ivan Aksamentov (software developer) and Cornelius Roemer (staff scientist). In addition, Emma Hodcroft remains a core member as she starts her own research group at the Swiss Tropical and Public Health Institute in Basel.

## Recent activities (mid-2022 to present)

Work on SARS-CoV-2 was all-consuming throughout 2020 and 2021. However, after the Omicron wave in early 2022, we were able to start to move away from emergency response and subsequent to mid-2022 we have returned to other pathogens and to broader development directions.

In terms of **SARS-CoV-2**, we've continued to assist with nomenclature and clade / lineage classification from sequence data. We've designated [40 Nextstrain clades](https://github.com/nextstrain/ncov-clades-schema) that meet quantitative thresholds for regional or global frequencies or frequency growth and have assisted in the designation of Pango lineages. We maintain [Nextclade](https://clades.nextstrain.org/) as a method to quickly classify user genomic data into corresponding clades and lineages. Such classification has enabled Multinomial Logistic Regression (MLR) models for [short-term forecasts of clade and lineage frequencies](https://nextstrain.org/sars-cov-2/forecasts/). In addition, we've continued to iterate on the "ncov" workflow for phylogenetic analysis of SARS-CoV-2 including additions like [focal builds for clade 21L (lineage BA.2) descended viruses](https://nextstrain.org/ncov/gisaid/21L/global/all-time) and [calculations of immune escape](https://nextstrain.org/ncov/gisaid/21L/global/all-time?c=immune_escape) based on deep mutational scanning data. The "ncov" workflow has automated ingest from GISAID and automated phylogenetic rebuilds.

Regarding **other pathogens**, much of our focus has been on seasonal influenza, mpox and RSV. For mpox and RSV we have automated data ingest from GenBank (seasonal flu requires downloads from GISAID via browser) and for all three we have automated phylogenetic builds. We've provided updated nomenclature for all three with [seasonal flu clades and subclades](https://github.com/influenza-clade-nomenclature), [mpox lineages](https://github.com/mpxv-lineages), and [RSV lineages](https://github.com/rsv-lineages). In each case, we've set up a specific GitHub organization to host nomenclature along with associated clade and lineage definition files. We continue to work with the US CDC and WHO GISRS to analyze seasonal influenza genetic and antigenic diversity, forecast clade frequencies and to provide technical reports for biannual vaccine composition meetings.

We continue to provide a general purpose augur toolkit with commands that are chained together via pathogen-specific Snakemake workflows that are [housed in pathogen-specific GitHub repositories](https://docs.nextstrain.org/en/latest/learn/parts.html). Historically, each pathogen has done things slightly differently as we iterate on design and encounter biological specifics. Recently, we've been making strides to **standardize workflows and provide consistent automation**. This [standardized pathogen repo](https://github.com/nextstrain/pathogen-repo-guide) includes data ingest and curation from GenBank, sharing out of curated sequence FASTA and metadata TSV via data.nextstrain.org, production of Nextclade datasets and phylogenetic analysis posted to nextstrain.org. Additionally, the standard repo includes infrastructure to automate GenBank data ingest and phylogenetic analysis that can be run on a regular schedule. Although SARS-CoV-2, seasonal influenza, mpox and RSV run automatically, other pathogens require manual updating. To these ends, we've been improving augur functionality to ingest data from GenBank and to work with VCF data.

Building on the popularity of **Nextclade** in the early pandemic, much of the activities of the Basel team has been focused on developing a more general and robust version. In January 2024, we released [version 3](https://github.com/nextstrain/nextclade/releases/tag/3.0.0) that supports (a) complex annotations, including splicing, slippage, and circular genomes, (b) viruses with up to 30% sequence divergence, (c) simple tree building instead of just phylogenetic placement, (d) automatic suggestion of suitable datasets and (e) datasets contributed and maintained by the community. Nextclade currently supports SARS-CoV-2, seasonal influenza viruses, RSV, MPXV and PRRSV-2 (via community).

Development on **nextstrain.org** focused on sharing and surfacing datasets. We have supported ["community" datasets](https://docs.nextstrain.org/en/latest/guides/share/community-builds.html) since 2018 through the ability to display phylogenetic analyses deposited on GitHub. More recently, the Seattle team has implemented an integrated solution called ["Nextstrain Groups" where users can maintain their own public or private analyses](https://docs.nextstrain.org/en/latest/learn/groups/index.html). There are currently 53 user groups, including public health authorities, with groups datasets managed via the CLI. The same credentials to login via `nextstrain login` are used to login to nextstrain.org via browser. We've recently made improvements to AWS infrastructure and permissions to streamline inclusion of new groups, but this still requires individuals to reach out to us via email. We've provided a white-labeled version of Nextstrain Groups for the US CDC to use internally. In addition, we've implemented new functionality to surface ["snapshots" of historical datasets](https://docs.nextstrain.org/en/latest/guides/snapshots.html) on nextstrain.org.

Development of **Auspice tree visualization** has focused on inclusion of a ["measurements panel"](https://www.frontiersin.org/articles/10.3389/fbinf.2023.1069487/full) intended for displaying titer or DMS data and on improvements to the "entropy panel" to support more complex genome architectures.

In terms of **training and technical support** we've provided standalone installers for Linux, Mac, and Windows (allowing one-command installation) and new managed runtimes for Conda and Singularity, centralized documentation and tutorials at [docs.nextstrain.org](https://docs.nextstrain.org), hosted weekly drop in office hours via Zoom, responded to user emails to hello@nextstrain.org and responded to posts to discussion board [discussion.nextstrain.org](https://discussion.nextstrain.org). We've also led hands-on training sessions at VEME in Aug 2022 and Aug 2023 and hosted intern Alhaji Olono from ACEGID in summer 2023 to work on a Nextstrain build for African Swine Fever Virus.

Publications since 2021 have included:
- [Huddleston et al. 2021. Augur: a bioinformatics toolkit for phylogenetic analyses of human pathogens. J. Open Source Softw.](https://doi.org/10.21105/joss.02906)
- [Aksamentov et al. 2021. Nextclade: clade assignment, mutation calling and quality control for viral genomes. J. Open Source Softw.](https://doi.org/10.21105/joss.03773)
- [Lee, Hadfield et al. 2023. Joint visualization of seasonal influenza serology and phylogeny to inform vaccine composition. Frontiers Bioinf.](https://www.frontiersin.org/articles/10.3389/fbinf.2023.1069487)

## Directions for the future

It remains challenging for us to winnow down strategic priorities. Here, we've identified 6 major directions to focus on for the coming year:

1. **Building out automated workflows to ~20 pathogens**. Expanding the number of "core" pathogens that have automated ingest and phylogenetics would address the original remit of Nextstrain. Each core pathogen provides a real-time view on nextstrain.org, but also curated data and a starting point for user analyses.
2. **Improvements to Nextclade**. Planned directions include calling mutations relative to different references, identification of clade founders and redoing the alignment viewer.
3. **Frequencies-focused visualization app**. We've made initial strides to visualizing frequency data (separately for [SARS-CoV-2](https://nextstrain.org/sars-cov-2/forecasts/) and [seasonal influenza](https://flu-frequencies.vercel.app/)). We'd like to consolidate these efforts and provide a platform for evolutionary forecasts for SARS-CoV-2 and seasonal influenza.
4. **Scaling and other Auspice improvements**. It remains a consistent frustration to have phylogenetic analyses limited to ~5000 samples. This limitation is largely due to JavaScript performance of manipulating thousands of SVG objects. Even without resorting to WebGL there should be strategies to improve scaling of Auspice. And additionally there remain many basic visualization improvements (notably tree zoom and manipulation) to be implemented.
5. **Improvements to nextstrain.org**. We'd like to continue to build out platform aspects to better surface datasets, and also to provide a GUI interface for modifying Groups data.
6. **Improvements to documentation**. We'd like to provide enough documentation for outside users to use and modify existing pathogen workflows and also to create their own bespoke workflows. This includes common issues of subsampling and data ingest.