---
title: "Augur Commands"
---

Augur commands -- for instance `augur parse` or `augur align` -- are designed to be stand alone commands performing one bioinformatic task.


All Augur commands are run via the `augur` program -- you can see a list of these by running `augur --help`.
More details for each command can be seen via `augur <command> --help` (e.g. `augur traits --help`).


For an online list of Augur commands and their arguments please see [the augur documentation [external link]](https://nextstrain-augur.readthedocs.io/en/stable/cli.html).

---
As of Augur version 5.1.1, these are the available commands (generated via `augur --help`):

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
