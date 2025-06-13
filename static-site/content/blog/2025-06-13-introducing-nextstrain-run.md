---
author: Thomas Sibley
date: "2025-06-13"
title: "Introducing `nextstrain run`"
sidebarTitle: "Introducing `nextstrain run`"
---

One of our [planned directions for 2025][] is to facilitate running pathogen
workflows with user data and user config. At the beginning of May we took a big
step toward reaching that goal, with the introduction of the new [`nextstrain
run`][] command in the [version 10.0.0][] release of our [Nextstrain CLI][] package.
This new command was accompanied by new supporting features in the existing
[`nextstrain setup`][], [`nextstrain update`][], and [`nextstrain version`][] commands.

`nextstrain run` is a new way of running our [pathogen workflows][] without the
co-mingling of your input and output files with the workflow's own source code.

Indeed, you don't even need to download the pathogen repository source code
yourself or manage updates to it with Git at all.  (Git is a very useful tool
for software development, but it's a huge source of confusion and frustration
for people who just want to run the workflows.)

Instead, you provide an _analysis directory_ containing your input files.  For
example, your input files might include a `config.yaml` file to adjust
filtering and subsampling parameters and a pair of `metadata.tsv` and
`sequences.fasta` files containing additional private data.  This analysis
directory is used as the working directory for the workflow run and is where
all output files will be created as well.  For example, for a [phylogenetic
workflow][], the `results/` directory containing alignments and the `auspice/`
directory containing dataset JSONs will both be within your analysis directory.
Multiple separate analysis directories—for example, with different configs,
input data, etc.—may be used for concurrent runs of the same pathogen workflow
without conflict, allowing for independent outputs and analyses.

Getting started with a pathogen's workflows doesn't involve Git like in the
past.  Instead, you initially set up the pathogen with `nextstrain setup` (e.g.
`nextstrain setup measles`).  This downloads the pathogen's files into an
isolated and automatically-managed location.  (And while you’re not expected to
ever need to dig into that location, it’s not hidden from you either.)  The
latest version of the pathogen is set up by default, but multiple specific
versions may be set up and run independently without conflict, allowing for
comparisons of output across versions.

Over time, you can update the pathogen with `nextstrain update` (e.g.
`nextstrain update measles`).  Pathogens have both released versions (e.g.
`v1`) which don't change after release and unreleased development versions
(e.g. `main`) that are continually changing.  Updates happen between released
versions (e.g. `v1` → `v2`) and in-place for development versions.

You can see what pathogens (and what versions) you have set up with `nextstrain
version --pathogens`.  (Adding the [`--verbose` flag][] shows more details.)

Compared to [`nextstrain build`], this new `nextstrain run` command is a
higher-level interface to running pathogen workflows that provides benefits
like concurrent independent runs, versioning, and updates while not requiring
knowledge of Git or management of pathogen repositories and source code.  For
active authorship and development of workflows, the `nextstrain build` command
remains more suitable for many tasks.  (For now!)

It's still early days, and right now, only [measles][] and [zika][] support
`nextstrain run` and the overall configurability of these repos is limited at
that. Still, you can try the basics out yourself by following the example shell
session at the end of this post.

Support in more pathogens is coming, along with increased configurability and
ease of adding your own data.  We're also working on standardizing and
documenting the workflow interfaces (e.g. config, inputs, etc).

All of this work is part of our broader “workflows as programs” endeavor where
we’re making our complex pathogen workflows easier to run with your data and
more like typical, mature bioinformatics programs.  `nextstrain run` is a big
step forward in that direction, but there's still lots of work to do.  You can
follow along with much of the nitty gritty of development in [our public
tracking issue][].  If you have questions or comments, please feel free to post
to our [discussion forum][], where many members of the Nextstrain team
participate.

---

```console
$ nextstrain setup measles
Setting up measles@main…
[…]
All good!  Set up of measles@main complete.

$ nextstrain version --pathogens
Nextstrain CLI 10.2.0 (standalone)

Pathogens
  measles
    measles@main (default)

$ mkdir /tmp/example-analysis
$ nextstrain run measles phylogenetic /tmp/example-analysis
Running the 'phylogenetic' workflow for pathogen measles@main
[…]

$ tree /tmp/example-analysis
/tmp/example-analysis
├── auspice
│   ├── measles_genome.json
│   ├── measles_genome_tip-frequencies.json
│   ├── measles_N450.json
│   └── measles_N450_tip-frequencies.json
├── data
│   └── […]
└── results
    ├── genome
    │   ├── aa_muts.json
    │   ├── aligned.fasta
    │   ├── nt_muts.json
    │   ├── tree.nwk
    │   └── […]
    └── N450
        └── […]

6 directories, 28 files

$ nextstrain view /tmp/example-analysis

——————————————————————————————————————————————————————————————————————————————
    The following datasets and/or narratives should be available in a moment:
       • http://127.0.0.1:4000/measles/genome
       • http://127.0.0.1:4000/measles/N450
——————————————————————————————————————————————————————————————————————————————
[…]
```

[planned directions for 2025]: /blog/2025-03-31-annual-update-march-2025
[version 10.0.0]: https://docs.nextstrain.org/projects/cli/en/latest/changes/#v10-0-0
[Nextstrain CLI]: https://docs.nextstrain.org/projects/cli/
[`nextstrain run`]: https://docs.nextstrain.org/projects/cli/page/commands/run/
[`nextstrain setup`]: https://docs.nextstrain.org/projects/cli/page/commands/setup/
[`nextstrain update`]: https://docs.nextstrain.org/projects/cli/page/commands/update/
[`nextstrain version`]: https://docs.nextstrain.org/projects/cli/page/commands/version/
[`--verbose` flag]: https://docs.nextstrain.org/projects/cli/page/commands/version/#cmdoption-nextstrain-version-verbose
[`nextstrain build`]: https://docs.nextstrain.org/projects/cli/page/commands/build/
[pathogen workflows]: https://docs.nextstrain.org/page/reference/glossary.html#term-workflow
[phylogenetic workflow]: https://docs.nextstrain.org/page/reference/glossary.html#term-phylogenetic-workflow
[measles]: https://github.com/nextstrain/measles
[zika]: https://github.com/nextstrain/zika
[our public tracking issue]: https://github.com/nextstrain/public/issues/1
[discussion forum]: https://discussion.nextstrain.org
