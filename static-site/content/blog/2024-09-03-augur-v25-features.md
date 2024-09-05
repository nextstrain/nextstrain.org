---
author: "The Nextstrain team"
date: "2024-09-03"
title: "Notable changes in Augur v25"
sidebarTitle: "Augur v25 features"
---

The Nextstrain team has released several new versions of Augur – our
bioinformatics toolkit that assists with phylogenomic analyses – over
the past few months. We wanted to highlight some of the significant
feature improvements in these new releases.

### Excel and OpenOffice support

One of the features we are most excited to announce is that the
[`augur curate`][] command now supports both Excel (`.xlsx` and
`.xls`) and OpenOffice (`.ods`) files as metadata inputs. This allows
the easy conversion of Excel or OpenOffice files into the expected
metadata TSV used by other Augur commands. *This new feature is
available in Augur v25.2 and later.*

### Merging multiple metadata files

We are also very pleased to announce a new command, [`augur merge`][],
which allows for generalized merging of two or more metadata tables
based on a common field. We hope that this will make curation of
metadata inputs significantly easier. We also expect that this will
facilitate starting with existing pathogen repos with curated data
available via [data.nextstrain.org][] and “spiking in” extra,
non-public metadata for additional analysis. We plan to extend this
functionality to support merging of sequence files in a future Augur
release. *The merge feature is available in Augur v25.3 and later.*

### Weighted sampling

We have extended `augur filter` with a new flag,
[`--group-by-weights`][], that adds weighted sampling. This allows
subsampling to follow quantities like population size or case counts
to facilitate more representative analyses. Or conversely, this allows
for sampling of a specific “focal” region with more intensity than
other “contextual” regions. This is described in detail in an updated
[Filtering and Subsampling guide][], as well as the help text of the
`--group-by-weights` flag. *This new flag is available in Augur
v25.3 and later.*

### Generalized read/write commands

We have added two new I/O related commands, [`augur read-file`][] and
[`augur write-file`][]. By piping to/from these new commands, external
programs can do I/O “the Augur way”, including transparent handling of
compression formats and newlines consistent with the rest of Augur. We
hope that exposing this functionality will make it easier to integrate
external programs into Augur pipelines in a consistent, convenient
way. *These new commands are available in Augur v25.3 and later.*

### Six new augur curate commands for transforming metadata

We added a number of new sub commands to [`augur curate`][]. These
commands ease the manipulation of various sorts of dataset metadata:

* [`augur curate abbreviate-authors`][] abbreviates author lists to
  "&lt;first author&gt;, et al."
* [`augur curate apply-geolocation-rules`][] applies user-curated
  geolocation rules to geolocation fields
* [`augur curate apply-record-annotations`][] applies user-curated
  annotations to existing fields
* [`augur curate parse-genbank-location`][] parses the `geo_loc_name`
  field from GenBank records
* [`augur curate rename`][] renames field / column names.
* [`augur curate transform-strain-name`][] filters strain names using
  a regular expression

*All of these new sub-commands are available in Augur v25.0 and later.*

### Reduction in Auspice JSON sizes of around 30%

[`augur export v2`][] now limits numerical precision on floats in the
exported JSON file. This should not change how a dataset is displayed
or interpreted in Auspice, but reduces the gzipped and minimised JSON
file size by around 30%, depending on the dataset. This will improve
page load times in Auspice and nextstrain.org. *This change is present
in Augur v25.2 and later.*

### Debug mode (verbose logging)

We added a new debugging mode to the entire Augur suite, which is
enabled by setting the `AUGUR_DEBUG` environment variable to a
non-empty value (e.g., `export AUGUR_DEBUG=1`).

Currently, setting this variable only causes Augur commands to print
additional information about the specifics of handled (i.e.,
anticipated) errors. For example, stack traces and parent exceptions
in an exception chain, which are normally not displayed, will be
included when this variable is set.

In future Augur releases, we anticipate using this variable to
conditionalize new debugging and troubleshooting features, such as
verbose operation logging. *This debugging mode is available in Augur
v25.3 and later.*

### Thanks

Thanks for reading our summary of new Augur features! We hope they
prove to be useful in your Augur pipelines and workflows. We welcome
feedback about these new features, and suggestions for additional
ones, either via our [discussion site][], or by opening issues in the
[Augur GitHub][] repo.

[`augur curate`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/curate/index.html
[`augur merge`]: https://docs.nextstrain.org/projects/augur/en/latest/usage/cli/merge.html
[data.nextstrain.org]: https://data.nextstrain.org
[`--group-by-weights`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/filter.html#augur-make_parser-subsampling
[Filtering and Subsampling guide]: https://docs.nextstrain.org/en/latest/guides/bioinformatics/filtering-and-subsampling.html
[`augur read-file`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/read-file.html
[`augur write-file`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/write-file.html
[`augur curate abbreviate-authors`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/curate/abbreviate-authors.html
[`augur curate apply-geolocation-rules`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/curate/apply-geolocation-rules.html
[`augur curate apply-record-annotations`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/curate/apply-record-annotations.html
[`augur curate parse-genbank-location`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/curate/parse-genbank-location.html
[`augur curate rename`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/curate/rename.html
[`augur curate transform-strain-name`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/curate/transform-strain-name.html
[`augur export v2`]: https://docs.nextstrain.org/projects/augur/en/stable/usage/cli/export.html#v2
[discussion site]: https://discussion.nextstrain.org/
[Augur GitHub]: https://github.com/nextstrain/augur
