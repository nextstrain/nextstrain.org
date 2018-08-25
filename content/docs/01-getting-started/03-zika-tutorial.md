---
title: "Zika Tutorial"
date: "2018-08-23"
---

This tutorial explains how to build a Nextstrain site for the Zika virus.
We will first build a site step by step using an example data set.
Then we will see how to automate this stepwise process by defining a pathogen build script.
If you have not already, install augur and auspice.

Nextstrain builds typically require the following steps:

1. prepare pathogen sequences and metadata
2. align sequences
3. construct a phylogeny from aligned sequences
4. annotate the phylogeny with inferred ancestral pathogen dates, sequences, and traits
5. export the annotated phylogeny and corresponding metadata into auspice-readable format

First, download the Zika pathogen build which includes example data and a pathogen build script.

```
git clone https://github.com/nextstrain/zika.git
cd zika
```

A Nextstrain site typically starts with a collection of pathogen sequences in a single FASTA file and a corresponding table of metadata describing those sequences in a tab-delimited text file.
For this tutorial, we will use an example data set whose FASTA sequences also include metadata in the same file.
Create a directory for your data and copy the example data into that directory.

```
mkdir -p data/
cp example_data/zika.fasta data/
```

Split annotated FASTA sequences into one FASTA file with sequences and a tab-delimited file with metadata and store these outputs in a new directory.
The `fields` parameter below informs augur how to interpret the metadata stored in the original FASTA file’s sequence names.

```
mkdir -p results
augur parse \
  --sequences data/zika.fasta \
  --output-sequences results/sequences.fasta \
  --output-metadata results/metadata.tsv \
  --fields strain virus accession date region country division city db segment authors url title journal paper_url
```

Note that the resulting output FASTA has sequences named after the contents of the `strain` field in the original FASTA metadata.
The `strain` is a unique id used to reference a specific sequence in the tab-delimited metadata file.

Filter the parsed sequences and metadata to exclude strains from subsequent analysis and subsample the remaining strains to a fixed number of samples per group.

```
augur filter \
  --sequences results/sequences.fasta \
  --metadata results/metadata.tsv \
  --exclude config/dropped_strains.txt \
  --output results/filtered.fasta \
  --group-by country year month \
  --sequences-per-group 20 \
  --min-date 2012
```

Now the pathogen sequences are ready for analysis.
Create a multiple alignment of the sequences using a custom reference.
After this alignment, columns with gaps in the reference are removed.
Additionally, the `--fill-gaps` flag fills gaps in non-reference sequences with “N” characters.
These modifications force all sequences into the same coordinate space as the reference sequence.

```
augur align \
  --sequences results/filtered.fasta \
  --reference-sequence config/zika_outgroup.gb \
  --output results/aligned.fasta \
  --fill-gaps
```

Infer a phylogenetic tree from the multiple sequence alignment.

```
augur tree \
  --alignment results/aligned.fasta \
  --output results/tree_raw.nwk
```

The resulting tree is stored in [Newick format](http://evolution.genetics.washington.edu/phylip/newicktree.html).
Branch lengths in this tree measure nucleotide divergence.
Augur can also adjust branch lengths in this tree to position tips by their sample date and infer the most likely time of their ancestors, using [TreeTime](https://github.com/neherlab/treetime).
Run the `refine` command to apply TreeTime to the original phylogenetic tree and produce a "time tree".

```
augur refine \
  --tree results/tree_raw.nwk \
  --alignment results/aligned.fasta \
  --metadata results/metadata.tsv \
  --output-tree results/tree.nwk \
  --output-node-data results/branch_lengths.json \
  --timetree \
  --coalescent opt \
  --date-confidence \
  --date-inference marginal \
  --clock-filter-iqd 4
```

In addition to assigning times to internal nodes, the `refine` command filters tips that are likely outliers and assigns confidence intervals to inferred dates.
Branch lengths in the resulting Newick tree measure adjusted nucleotide divergence.
All other data inferred by TreeTime is stored by strain or internal node name in the corresponding JSON file.

TreeTime can also infer ancestral traits from an existing phylogenetic tree and metadata annotating each tip of the tree.
The following command infers the region and country of all internal nodes from the time tree and original strain metadata.
As with the `refine` command, the resulting JSON output is indexed by strain or internal node name.

```
augur traits \
  --tree results/tree.nwk \
  --metadata results/metadata.tsv \
  --output results/traits.json \
  --columns region country \
  --confidence
```

Next, infer the ancestral sequence of each internal node and identify any nucleotide mutations on the branches leading to any node in the tree.

```
augur ancestral \
  --tree results/tree.nwk \
  --alignment results/aligned.fasta \
  --output results/nt_muts.json \
  --inference joint
```

Identify amino acid mutations from the nucleotide mutations and a reference sequence with gene coordinate annotations.
The resulting JSON file contains amino acid mutations indexed by strain or internal node name and by gene name.
To export a FASTA file with the complete amino acid translations for each gene from each node’s sequence, specify the `--alignment-output` parameter in the form of `results/aligned_aa_%GENE.fasta`.

```
augur translate \
  --tree results/tree.nwk \
  --ancestral-sequences results/nt_muts.json \
  --reference-sequence config/zika_outgroup.gb \
  --output results/aa_muts.json
```

Finally, collect all node annotations and metadata and export it all in auspice’s JSON format.
The resulting tree and metadata JSON files are the inputs to the auspice visualization tool.

```
augur export \
  --tree results/tree.nwk \
  --metadata results/metadata.tsv \
  --node-data results/branch_lengths.json \
              results/traits.json \
              results/nt_muts.json \
              results/aa_muts.json \
  --colors config/colors.tsv \
  --auspice-config config/auspice_config.json \
  --output-tree auspice/zika_tree.json \
  --output-meta auspice/zika_meta.json
```

To visualize the resulting Nextstrain site, copy the auspice files into the `data` directory of your local auspice installation, start auspice, and navigate to http://localhost:4000/local/zika in your browser.

```
# Copy files into auspice data directory.
mkdir ~/src/auspice/data/
cp auspice/*.json ~/src/auspice/data/

# Start auspice.
cd ~/src/auspice/data/
npm run dev
```

While it is instructive to run all of the above commands manually, it is more practical to automate their execution with a single script.
Nextstrain implements these automated pathogen builds with [Snakemake](https://snakemake.readthedocs.io/en/stable/index.html) by defining a `Snakefile` like the one in the Zika pathogen code.

To run the automated pathogen build for Zika, delete the output from the manual steps above and run Snakemake.

```
rm -rf results/ auspice/
snakemake
```

This command runs all of the manual steps above up through the auspice export.
As before, you can copy the resulting auspice JSON files into your auspice installation directory and confirm that you have produced the same Zika site.

## Next steps

  * Learn more about [augur commands](../bioinformatics)
  * Learn more about [auspice visualizations](/docs/visualisation/introduction)
  * Fork the [Zika pathogen repository on GitHub](https://github.com/nextstrain/zika), modify the Snakefile to make your own pathogen build, and view the resulting site at `https://nextstrain.org/community/<orgName>/<repoName>` for your corresponding GitHub username/org name and repository name.
