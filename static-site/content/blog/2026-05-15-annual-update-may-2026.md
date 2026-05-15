---
author: "JT McCrone, Richard Neher, Trevor Bedford"
date: "2026-05-15"
title: "Nextstrain Annual Update May 2026"
sidebarTitle: "Annual Update May 2026"
---

Nextstrain development supports real-time genomic surveillance for two central purposes:

1. *Routine real-time surveillance of endemic pathogens*
2. *Rapid outbreak response*

Over the past year we advanced these goals through continued development of pathogen specific resources, targeted outbreak response, and advances to the bioinformatic tooling and infrastructure needed to support real-time genomic surveillance.  

# Recent Activities (April 2025 to May 2026)

## Pathogen specific development

This year we continued to track the evolution and spread of important seasonal respiratory viruses. Our [SARS-CoV-2](/ncov) and [seasonal influenza](/seasonal-flu) builds automatically tracked the emergence and spread of novel, rapidly expanding lineages such as BA.3.2 in SARS-CoV-2 and subclade K in influenza H3N2. The recent [H5N1 panzootic](/community/narratives/moncla-lab/nextstrain-narrative-hpai-north-america@main/HPAI-in-North-America) is a pertinent reminder that seasonal antigenic drift makes up a small portion of the global evolutionary dynamics of influenza. We restructured the underlying data for our influenza builds to better support segment specific analyses that span the full host-range of the virus.

We responded to two emerging outbreaks this past year. In response to the 2025 Ebola outbreak in Kasai (DRC) we developed a [unified analysis](/ebola/all-outbreaks) that places this outbreak in context with all other Ebola outbreaks. We also updated our [measles builds](/measles/genome) (whole genome and N450) to better capture the recent outbreak spreading in the US and have provided a [USA-specific analysis](/groups/blab/measles/north-america/) as well.

We continued to add baseline analyses across endemic and emerging viral pathogens. For each pathogen we provide a GitHub repository that contains workflows for automated data ingest from NCBI GenBank, a pipeline to generate Nextclade datasets, and automated phylogenetic analysis. This year we completed automated builds for

* Chikungunya at [/chikv](/chikv)  
* Mumps at [/mumps](/mumps)  
* Nipah at [/nipah](/nipah)  
* Norovirus at [/norovirus](/norovirus)  
* Rubella at [/rubella](/rubella)  
* Tuberculosis at [/tb](/tb)

In particular we would like to highlight our work with *M. tuberculosis*. TB marks Nextstrain's first bacterial core pathogen. Not only does this work expand our impact beyond viruses, but the process of developing an automated TB build facilitates using FASTQ as entrypoint for Nextstrain workflows, consistent with community standards for sharing bacterial sequencing data.

We've posted a preprint to bioRxiv describing our computational pipelines and infrastructure for data curation and automated rebuilds for 21 viruses and *M. tuberculosis*. It's available as:

* Andrews et al. 2026. Nextstrain automates real-time phylodynamic analysis of open data for endemic and emerging pathogens. bioRxiv. [doi.org/10.64898/2026.03.23.713807](https://doi.org/10.64898/2026.03.23.713807) 

## Bioinformatic tooling

This year we introduced several advances to our tool chain that make reproducible phylogenetic analyses more user friendly. Over the summer we introduced `nextstrain run`, a 'git-free' way to install and run Nextstrain pathogen workflows. The [run command](https://docs.nextstrain.org/projects/cli/en/latest/commands/run/) separates input files and results from the often messy pipeline code needed for a reproducible pathogen build. Users are able to customize pipeline arguments through a config file without knowledge of Snakemake. Nextstrain run marks a key step in increasing the accessibility of genomic surveillance and we look forward to including this feature in future workflows.

We standardized and simplified the way users can [combine their own data with contextual data in a pathogen build](/blog/2025-09-29-standardized-multiple-inputs). The pattern allows for specification of multiple inputs to a workflow with a common setup being a base input of curated data from [data.nextstrain.org](http://data.nextstrain.org) and "additional input" of local user data. These data are intelligently combined so that user data can act as an overlay to the base of curated data.

Selecting appropriate sequence data for an analysis often requires subsampling, and we introduced `augur subsample` and `augur proximity` to help with this process. Our new [augur proximity command](https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/proximity.html) enables assembling a contextual dataset by selecting sequences genetically close to a focal dataset. [Augur subsample](https://docs.nextstrain.org/en/latest/guides/bioinformatics/filtering-and-subsampling.html) allows for more involved strategies than were previously possible with `augur filter`. The subsamples can be defined in a config file. With the addition of proximity and subsample it is now easier to design complex or hierarchical subsampling schemes through YAML configuration without the need to write bespoke Snakemake rules.

We also made several improvements to our phylogenetic visualization software Auspice. We shipped the "streamtrees" feature that was alluded to last year. These collapsed clades condense large phylogenetic trees into more manageable components while still displaying the frequency of traits in each clade. We introduced a 'focus on selected' feature, which clearly distinguishes regions of the tree that are ancestral to selected tips. This view approximates a build with just the selected samples allowing for rapid exploration of large datasets. More recently, we extended the feature to also horizontally zoom into parts of the tree that cover a specific time span. Finally, we implemented a new dataset modal selector to streamline navigation between datasets available for a particular pathogen. These visualization developments are expanded on in [a recent blogpost](/blog/2026-03-12-auspice-updates). 

## Nextclade

We continued to improve Nextclade in line with our roadmap from last year. In particular, 

* Nextclade can now report mutations relative to clade founders or particular strains (e.g. vaccine strains) rather than only a fixed reference sequence. In addition to being an important feature for users, it also means that one dataset per pathogen is often enough so we don't have to keep maintaining different datasets for different references, e.g. Wuhan-Hu-1, BA.2, BA.2.86 etc...
* One can now submit files containing sequences from different viruses or different segments. These will be automatically sorted and results provided as an Excel file with one sheet per virus/segment.

An integrated support for segmented viruses has not yet been tackled. We also maintained and expanded the available datasets. Mpox now supports the new WHO recommended nomenclature, influenza datasets now exist for all segments and all human lineages. In addition to the datasets we maintain, we have also seen encouraging uptick in community contributions. Emma Hodcroft's group started a consortium collection for Enteroviruses, Louise Moncla's group maintains avian influenza H5 datasets, ITPS and V-Gen Lab all contributed arbovirus datasets. 

## Other work to highlight

Over the past year we also worked to increase the transparency and reproducibility of Nextstrain hosted analyses. We have begun to rely more heavily on open source data and [rolled out support for Pathoplexus as a data source](/blog/2025-08-24-Nextstrain-PPX) where applicable. Currently, we use Pathoplexus data in mpox, RSV, Ebola, measles, HMPV and WNV analyses. Where feasible, we also surfaced the sequence and metadata files behind each build at [nextstrain.org/pathogens/files](/pathogens/files). These resources provide users with direct access to the data used in each build and can serve as a starting point for their own analyses. This philosophy is informed in part by [GISAID's unilateral decision to terminate SARS-CoV-2 datafeed](/blog/2025-11-06-gisaid-based-ncov-analyses) for Nextstrain and other groups. 

We scaled back on our [previous plans](/blog/2025-03-31-annual-update-march-2025) to develop a fully fledged "frequencies" app. Instead in the past year, we continued to develop our approach to clade/lineage frequency forecasting of a pre-defined set of clades or lineages. This work can be seen for seasonal influenza virus at [nextstrain.github.io/forecasts-flu/](https://nextstrain.github.io/forecasts-flu/).

# Planned directions for the future 

During the 2026-2027 period we plan to work towards increasing the accessibility of genomic surveillance to experts and non-experts alike. 

1. **Continue to build out config-based Augur commands.** Nextstrain run provides a user-friendly way to run Nextstrain pipelines on user supplied data. In the coming year, we plan to increase the flexibility of this approach by adopting a config-based API into more augur commands. Similar to our work on augur subsample, this will provide users with a degree of customization that currently requires writing novel snakemake rules.  
2. **Roll out Nextstrain run for 3 gold-standard builds.** We plan to incorporate nextstrain run capabilities into three gold-standard pathogen builds. These will serve as examples for users who may wish to build their own nextstrain run capable pipelines. Current front runners are Zika, measles, and avian influenza which together cover a wide range of analysis needs.   
3. **Increase offline capabilities.** Nextstrain was created as a means to rapidly share interactive results from phylogenetic analyses. However, sometimes users need to share outputs that include sensitive data that cannot be hosted publicly online. To aid sharing sensitive results, we plan to develop the tooling needed to compile Nextstrain narratives into standalone HTML documents that can be shared without the need to host them on a server.  
4. **Continue to build towards 20-30 core-pathogens.** We believe this pattern of automated ingest via NCBI and automated phylogenetics to be a strong basis and would like to continue to establish a foundation of real-time analysis across pathogens. Currently we have 23 automated pathogens. Current contenders for automation include CCHFV, hepatitis B virus and rotavirus.   
5. **Support the analysis of complex datasets through a split-tree approach.** We will implement a partitioning approach to split large datasets into smaller analyses which can be linked together into a coherent picture of the whole dataset. We foresee this approach being useful for analysing large datasets, such as SARS-CoV-2, where sequences can be assigned to lineages using tools like Nextclade prior to tree building. This approach also has parallels for analyzing viruses such as influenza that undergo reassortment and are not fully captured by a single tree.  
6. **Explore the utility of LLMs to increase interpretability.** Phylogenetic results are difficult to interpret for individuals without expertise in genomic epidemiology. We plan to explore the utility and accuracy of LLMs to aid users in interpreting phylodynamic analyses conducted in the Nextstrain ecosystem.

# Funding and governance

Funding for Seattle-based operations for 2026-2027 will come primarily through:
1. Gates Foundation award for "Expanding and Decentralizing Nextstrain for Genomic Surveillance in LMICs" 
2. CDC Pathogen Genomics Centers of Excellence award through contract with WA Department of Health to facilitate use of Nextstrain in public health contexts

Funding for Basel-based operations for 2026-2027 will come primarily through:
1. Institutional core funding  
2. The SIB resource portfolio in 2025-2028 funding cycle  
3. NIAID PDN grant (through SIB)

Nextstrain started as a collaborative project coded up by Richard Neher and Trevor Bedford in early 2015, targeted exclusively to seasonal influenza tracking, then called [nextflu](http://hi.nextflu.org/). Since then it's grown to encompass a number of pathogens and has had a [number of contributors](/team) from both Richard's lab and Trevor's lab. We've also seen a robust community of users who've contributed analyses via Groups and via GitHub. We believe our central approach has advanced and continues to advance actionable genomic surveillance.

After more than a decade leading the Seattle side of Nextstrain, Trevor is stepping back from day-to-day operations to pursue new scientific directions focused on deep learning and biological sequence modeling. JT McCrone will be taking over from Trevor as PI for the Seattle-based portion of Nextstrain run out of the Fred Hutch. JT will serve as PI on both the Gates Foundation and CDC awards going forward. Long time contributors James Hadfield, Jover Lee and Victor Lin are remaining under JT's supervision in the Seattle office as direct Nextstrain contributors. John Huddleston (along with Richard) is still leading work on seasonal influenza. Ivan Aksamentov and Cornelius Roemer are remaining under Richard's supervision in the Basel office. Emma Hodcroft remains an independent contributor in her new role as PI at Swiss TPH. JT and Richard will co-lead Nextstrain going forwards, with Trevor continuing to attend calls and serving in an advisory capacity.
