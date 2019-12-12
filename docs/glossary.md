# Glossary

The canonical place for the definition of terms used in Nextstrain code, issues, documentation, and beyond.
Arranged not alphabetically but conceptually since the terms are searchable and directly linkable.

## Augur

A command-line application used for phylogenetic analysis.
<https://nextstrain-augur.readthedocs.io>

## Auspice

A web application used for phylogenetic visualization and analysis.
<https://nextstrain.github.io/auspice/>

## Build

A _build_ is a collection of data and code that produces [datasets](#dataset) for visualization on nextstrain.org.
Our [core](#core) builds—for example [Zika](https://github.com/nextstrain/zika)—are organized as git repositories hosted on GitHub which contain a [Snakemake](https://snakemake.readthedocs.io) workflow using [Augur](https://nextstrain-augur.readthedocs.io), configuration, and data.
Builds produce [JSONs](#jsons) which can be visualized by [Auspice](https://nextstrain.github.io/auspice/) and may be deployed to Nextstrain.

## Source

An implementation concept encompassing both the place from which [JSONs](#jsons) are fetched for a [build](#build) and the authorization rules for their visibility.
Except for our sources for core, staging, and community builds, sources have a 1:1 correspondence with [groups](#group).
Defined by code in [auspice/server/sources.js](https://github.com/nextstrain/nextstrain.org/blob/master/auspice/server/sources.js).

## Dataset

A collection of [JSONs](#jsons) for a single conceptual thing; the shared file prefix of a set of [JSONs](#jsons).
For example `flu/seasonal/h3n2/ha/2y` identifies a _dataset_ which corresponds to the files:

* `flu_seasonal_h3n2_ha_2y_meta.json`
* `flu_seasonal_h3n2_ha_2y_tree.json`
* `flu_seasonal_h3n2_ha_2y_tip-frequencies.json`

Some [builds](#build) produce a single, synonymous dataset, like Zika.
Others, like seasonal flu, produce many datasets.

## Narratives

A Markdown file containing special annotations for display in [Auspice](#auspice).
Deployed to [sources](#source) alongside datasets.

## JSONs

Special `.json` files produced and consumed by [Augur](#augur) and visualized by [Auspice](#auspice); the files making up a [dataset](#dataset).

## Core

The primary general-interest [builds](#build) maintained by the Nextstrain team, shown first on the Nextstrain homepage.
[JSONs](#jsons) are fetched from the `nextstrain-data` S3 bucket.

## Staging

Testing area for the [core builds](#core).
[JSONs](#jsons) are fetched from the `nextstrain-staging` S3 bucket.

## Community

[Builds](#build) maintained by community members, with no coordination from the Nextstrain team required.
[JSONs](#jsons) are fetched from community-managed GitHub repositories.
Some community builds are highlighted on the Nextstrain homepage.

## User

An individual login account associated with one or more [groups](#group).
Managed in an AWS Cognito User Pool called `nextstrain.org`.
Not to be confused with AWS IAM users.

## Group

A named set of [users](#user) with access to see and update a set of builds.
Each group has a related [source](#source), which typically authorizes access based on the group.
Managed in an AWS Cognito User Pool called `nextstrain.org`.
Not to be confused with AWS IAM groups.
