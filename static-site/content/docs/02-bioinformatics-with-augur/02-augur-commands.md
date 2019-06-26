---
title: "Augur commands"
---

All augur commands are run via the `augur` program. You can see them all by running `augur --help`, which shows:

    parse               Parse delimited fields from FASTA sequence names into
                        a TSV and FASTA file.
    filter              Filter and subsample a sequence set.
    mask                Mask specified sites from a VCF file.
    align               Align multiple sequences from FASTA.
    tree                Build a tree using a variety of methods.
    refine              Refine an initial tree using sequence metadata.
    ancestral           Infer ancestral sequences based on a tree.
    translate           Translate gene regions from nucleotides to amino
                        acids.
    reconstruct-sequences
                        Reconstruct alignments from mutations inferred on the
                        tree
    clades              Assign clades to nodes in a tree based on amino-acid
                        or nucleotide signatures.
    traits              Infer ancestral traits based on a tree.
    sequence-traits     Annotate sequences based on amino-acid or nucleotide
                        signatures.
    lbi                 Calculate LBI for a given tree and one or more sets of
                        parameters.
    distance            Calculate the distance between sequences across entire
                        genes or at a predefined subset of sites.
    titers              Annotate a tree with actual and inferred titer
                        measurements.
    frequencies         infer frequencies of mutations or clades
    export              Export JSON files suitable for visualization with
                        auspice.
    validate            Validate a set of JSON files intended for
                        visualization in auspice.
    version             Print the version of augur.


## Exploring each command

A usage reference for each command is available by running `augur <command> --help`.


    $ augur parse --help
    usage: augur parse [-h] --sequences SEQUENCES
                      [--output-sequences OUTPUT_SEQUENCES]
                      [--output-metadata OUTPUT_METADATA]
                      [--fields FIELDS [FIELDS ...]] [--separator SEPARATOR]
                      [--fix-dates {dayfirst,monthfirst}]

    Parse delimited fields from FASTA sequence names into a TSV and FASTA file.

    optional arguments:
      -h, --help            show this help message and exit
      --sequences SEQUENCES, -s SEQUENCES
                            sequences in fasta or VCF format (default: None)
      ...
    …

> If you have the [Nextstrain CLI](https://pypi.org/project/nextstrain-cli) installed from the [Quickstart](../getting-started/quickstart), then you won't have `augur` available to you natively as it's accessed via a docker container. In this case you can use `nextstrain shell .` to start a new shell in which you can run augur commands. The `.` makes the current directory (`.`) available inside the new shell. To leave the Nextstrain shell, use the `exit` command; you'll be returned to your previous shell.

