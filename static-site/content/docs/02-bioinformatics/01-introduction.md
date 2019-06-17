---
title: "Bioinformatics Introduction"
---

Nextstrain's bioinformatics toolkit is called __augur__.
It is a core part of the Nextstrain ecosystem used by all of our [pathogen builds](../pathogen-builds), and all source code is available on [GitHub](https://github.com/nextstrain/augur). 

Augur provides ways to perform common bioinformatics tasks through a collection of commands which are designed to be composable into larger processing pipelines.
This means the commands work well both independently and together, embracing the [philosophy of composability](https://en.wikipedia.org/wiki/Composability).

Augur is suitable for use with both relatively small viral genomes, like Zika, as well as much larger bacterial genomes, like tuberculosis.

Currently our [Zika](/zika), [Ebola](/ebola), and [Lassa](/lassa) builds use the latest version of augur, described here.
Our [Seasonal Influenza](/flu/seasonal), [Avian Influenza](/flu/avian), [West Nile Virus](/WNV), [Mumps](/mumps), [Measles](/measles), and [Dengue](/dengue) builds use an older version of augur, but the plan is to eventually move them to the newer version.


## Commands

All augur commands are run via the `augur` program.  The available commands are:

* `augur parse`
* `augur filter`
* `augur mask`
* `augur align` (uses [mafft](https://mafft.cbrc.jp/alignment/software/))
* `augur tree` (uses [RAxML](https://sco.h-its.org/exelixis/web/software/raxml/index.html), [FastTree](http://www.microbesonline.org/fasttree/), or [IQ-TREE](http://www.iqtree.org/))
* `augur refine`
* `augur ancestral`
* `augur translate`
* `augur traits`
* `augur sequence-traits`
* `augur titers`
* `augur export`
* `augur validate`

More information about each command is available on the [Bioinformatic Commands page](commands).

## Exploring the commands

A usage reference for each command is available by running `augur <command> --help`.

If you have the [Nextstrain CLI](https://pypi.org/project/nextstrain-cli) installed from the [Quickstart](../getting-started/quickstart), you can use `nextstrain shell` to start a new shell in which you can run augur commands:

    $ nextstrain shell .
    $ augur parse --help
    usage: augur parse [-h] --sequences SEQUENCES
                   [--output-sequences OUTPUT_SEQUENCES]
                   [--output-metadata OUTPUT_METADATA]
                   [--fields FIELDS [FIELDS ...]]
                   [--separator SEPARATOR]
                   [--fix-dates {dayfirst,monthfirst}]
    …

The above example makes the current directory (`.`) available inside the new shell.
To leave the Nextstrain shell, use the `exit` command; you'll be returned to your previous shell.

## Next steps

* See [how augur commands are used in our Zika build](../getting-started/zika-tutorial).

* Learn more about [each augur command](commands).

* Learn more about [putting together your own pathogen builds](../pathogen-builds).
