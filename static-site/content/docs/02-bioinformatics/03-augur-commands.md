---
title: "Augur commands"
---


#### Table of Contents:
* [Exploring each command](#exploring-each-command)
* [augur filter](#augur-filter)
* [augur align](#augur-align)
* [augur tree](#augur-tree)
* [augur refine](#augur-refine)

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

---
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

---
## augur filter

Often the first step in the processing pipeline is to automatically select a subset of representative viruses.
This subsampling step is virus dependent -- for instance, we subsample influenza virus to achieve a more equitable temporal and geographic distribution. 
In the case of Zika or Ebola virus, substantial subsampling is not necessary and we mostly remove low quality sequences or duplicates. 

This command allows you to supply files defining sequences that must be removed (as well as sequences which must be included). We use this to remove duplicate viruses and known reassortant clusters in influenza, as well as force the inclusion of known vaccine strains.

---
## augur align

We use [MAFFT](http://mafft.cbrc.jp/alignment/software/) to align sequences.
Note that both the input & output of this command is a multi-fasta file, so it's possible to use any other aligner you wish.

This command also removes insertions relative to a reference sequence to enforce canonical site numbering.

> Watch out: If you do your own alignment, make sure the reference sequence -- and the gene annotations -- which you may provide to `augur translate` are in-sync with you're alignment.
A single unnoticed insertion in a coding region is going to make life much less fun!

---
## augur tree

We build a phylogenetic tree using [IQ-TREE](http://www.iqtree.org/) by default ([FastTree](http://www.microbesonline.org/fasttree/) and [RAxML](http://sco.h-its.org/exelixis/web/software/raxml/index.html) are also available).
The output is a simple newick tree file, so you can use plenty of other tree-building tools if you wish to.

---
## augur refine

We use [treetime](https://github.com/neherlab/treetime) to infer a time tree based on the (provided) divergence tree.
While the tree topology will generally be identical to the provided tree, treetime uses temporal information to try to resolve polytomies where possible.


> Even if you don't want to infer a timetree -- for instance if the clock signal is very weak in your dataset -- it's important to run `augur refine` as it labels the internal nodes.
If you don't do this, you won't be able to run other useful steps such as reconstructing ancestral mutations or traits.


