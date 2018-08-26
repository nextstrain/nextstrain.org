---
title: "TB Tutorial"
date: "2018-08-24"
---

This tutorial explains how to build a Nextstrain site for Tuberculosis sequences.
However, much of it will be applicable to any run where you are starting with VCF files rather than Fasta files.

We will first build a site step-by-step using an example data set. 
Then we will see how to automate this stepwise process by defining a pathogen build script which contains the commands we will run below.

Note that we will not use all the commands possible with Nextstrain. After running this tutorial, you may want to read about everything you can do with Nextstrain [here](/docs/bioinformatics/modules).

If you have not already, [install augur and auspice](/docs/getting-started/installation). 

## Nextstrain steps
Nextstrain builds typically require the following steps:
1. Prepare pathogen sequences and metadata  
    1.1 Filter the sequences (remove unwanted sequences and/or sample sequences)  
    1.2 Mask the sequences (exclude regions of the sequence that are unreliable)  
2. Construct a phylogeny  
    2.1 Construct an initial tree (to get topology)  
    2.2 Convert this into a time-resolved tree (to get accurate branch lengths)  
3. Annotate the phylogeny  
    3.1 Infer ancestral sequences  
    3.2 Translate genes and identify amino-acid changes  
    3.3 Reconstruct ancestral states (like location or host)  
4. Export the final results into auspice-readable format

## Download Data

First, download the Tuberculosis (TB) build which includes example data and a pathogen build script.
Then enter the directory you just cloned.

```
git clone https://github.com/nextstrain/tb.git
cd tb
```

## Prepare the Sequences

A Nextstrain site starts with:
* A VCF file containing all the sequences you want to include (variable sites only)
* A Fasta file of the reference sequence to which your VCF was mapped
* A tab-delimited metadata file _we need better info about what format this should be..._

Here, our intput file is compressed with gzip - you can see it ends with `.vcf.gz`. However, `augur` can take gzipped or un-gzipped VCF files. It can also produce either gzipped or un-gzipped VCF files as output. Here, we'll usually keep our VCF files gzipped, by giving our output files endings like `.vcf.gz`, but you can specify `.vcf` instead.

The data you need to make the TB site is in the `data` folder.

### Filter the Sequences

Sometimes you may want to exclude certain sequences from analysis. 
You may also wish to downsample your data based on certain criteria. `filter` lets you do this.
For more information on all the ways you can filter data, see [here](/docs/bioinformatics/modules).

For this example, we'll just exclude sequences in the file `dropped_strains.txt`.

First, we'll make a folder to hold all of our results from each step:

```
mkdir -p results
```

Now run filter:

```
augur filter \
    --sequences data/lee_2015.vcf.gz \
    --metadata data/meta.tsv \
    --output results/filtered.vcf.gz \
    --exclude data/dropped_strains.txt
```

### Mask the Sequences

There may be regions in your pathogen sequences that are unreliable. For example, areas that are hard to map because of repeat regions.
Often, these are excluded from analysis so that incorrect calls in these areas don't influence the results. The areas to be masked are specified in a BED-format file.

```
augur mask \
    --sequences results/filtered.vcf.gz \
    --output results/masked.vcf.gz \
    --mask data/Locus_to_exclude_Mtb.bed
```

## Construct the Phylogeny

Now our sequences are ready to start analysis. 

With VCF files, we'll do this in two steps that are slightly different from Fasta-input.
1. First, we'll use only the variable sites to construct a tree quickly. This will give us the topology, but the branch lengths will be incorrect.
2. Next, we'll consider the entire sequence to correct our branch lengths. At the same time, the sample date information will be used to create a time-resolved tree. 

### Get the Topology

You can use different tree-building programs to build your initial tree, and specify some parameters. You can see all the options for `tree` [here](/docs/bioinformatics/modules).

Here, we pass in the VCF file and the reference it was mapped to. We also pass in a list of sites that we'd like to exclude from building the topology. 
These are sites associated with drug-resistance mutations that can influence the topology. We exclude them here, but they'll be allowed to influence branch length and be included in ancestral sequence reconstruction later.
Finally, we use `iqtree` as the method to build the tree here.

```
augur tree \
    --alignment results/masked.vcf.gz \
    --vcf-reference data/ref.fasta \
    --output results/tree_raw.nwk \
    --exclude-sites data/drm_sites.txt \
    --method iqtree
```

### Fix Branch Lengths & Get a Time-Resolved Tree

Now we'll use the topology from `tree`, but get more accurate branch lengths and a time-resolved tree. 
This adjusts branch lengths in the tree to position tips by their sample date and infer the most likely time of their ancestors, using [TreeTime](https://github.com/neherlab/treetime).
There are _many_ options that can be specified here in `refine` to help you get a good tree - you can read about them [here](/docs/bioinformatics/modules).

`refine` will produce as output:
* another tree (newick format)
* a JSON format file with further information about each node

```
augur refine \
    --tree results/tree_raw.nwk \
    --alignment results/masked.vcf.gz \
    --vcf-reference data/ref.fasta \
    --metadata data/meta.tsv \
    --output-tree results/tree.nwk \
    --output-node-data results/branch_lengths.json \
    --timetree \
    --root residual \
    --coalescent opt
```

In addition to assigning times to internal nodes, the `refine` command filters tips that are likely outliers.
Branch lengths in the resulting Newick tree measure adjusted nucleotide divergence.
All other data inferred by TreeTime is stored by strain or internal node name in the JSON file.

## Annotate the Phylogeny

Now that we have an accurate tree and some information about the ancestral sequences, we can annotate some interesting data onto our phylogeny.
TreeTime can infer ancestral traits from an existing phylogenetic tree and metadata annotating each tip of the tree.

### Infer Ancestral Sequences

We can reconstruct the ancestral sequences for the internal nodes on our phylogeny and identify any nucleotide mutations on the branches leading to any node in the tree. You can read about all the options for `ancestral` [here](/docs/bioinformatics/modules).

For VCF runs, `ancestral` will produce another VCF that contains entries for the reconstructed sequence of all the internal nodes, as well as a JSON-format file that contains nucleotide mutation information for each node.

```
augur ancestral \
    --tree results/tree.nwk \
    --alignment results/masked.vcf.gz \
    --vcf-reference data/ref.fasta \
    --output results/nt_muts.json \
    --output-vcf results/nt_muts.vcf \
    --inference joint
```

### Translate Genes and get Amino-Acid Mutations

With `translate` we can identify amino acid mutations from the nucleotide mutations and a GFF file with gene coordinate annotations.
The resulting JSON file contains amino acid mutations indexed by strain or internal node name and by gene name.
`translate` will also produce a VCF-style file with the amino acid changes for each gene and each sequence, and Fasta file with the translated 'reference' genes which the VCF-style file 'maps' to. 

Because of the number of genes in TB, we will only translate some genes to save time. We can pass in a list of genes to translate (genes associated with drug resistance) using `--genes`. 
Note that the `--reference-sequence` option is how you pass in the GFF file with the gene coordinates.

```
augur translate \
    --tree results/tree.nwk \
    --ancestral-sequences results/nt_muts.vcf \
    --vcf-reference data/ref.fasta \
    --genes data/genes.txt \
    --reference-sequence data/Mtb_H37Rv_NCBI_Annot.gff \
    --output results/aa_muts.json \
    --alignment-output results/translations.vcf \
    --vcf-reference-output results/translations_reference.fasta

```

### Reconstruct Ancestral States

`traits` can reconstruct the probable ancestral state of traits like location and host (or others). 
This is done by specifying a column or columns in the meta-data file. 

`--confidence` will give confidence estimates for the reconstructed states. 
The output will be a JSON file with the state (and confidence, if specified) information for each node.

```
augur traits \
    --tree results/tree.nwk \
    --metadata data/meta.tsv \
    --columns location \
    --output results/traits.json \
    --confidence
```

## Export the Results

Finally, collect all node annotations and metadata and export it all in auspice’s JSON format.
The resulting tree and metadata JSON files are the inputs to the auspice visualization tool.

```
augur export \
    --tree results/tree.nwk \
    --metadata data/meta.tsv \
    --node-data results/branch_lengths.json \
                results/traits.json \
                results/aa_muts.json \
                results/nt_muts.json \
    --auspice-config data/config.json \
    --colors data/color.tsv \
    --lat-longs data/lat_longs.tsv \
    --output-tree auspice/tb_tree.json \
    --output-meta auspice/tb_meta.json
```

## Visualise the Results

Copy the files to the `data` directory inside the `auspice` directory (create this folder if it does not exist). 

Navigate to the `auspice` directory and use `npm run dev' to start auspice. 

Open a browser and navigate to [localhost:4000/local/tb](http://localhost:4000/local/tb) to visualise your run.


##Snakemake

While it is instructive to run all of the above commands manually, it is more practical to automate their execution with a single script.
Nextstrain implements these automated pathogen builds with [Snakemake](https://snakemake.readthedocs.io/en/stable/index.html) by defining a `Snakefile` like the one supplied in the TB respository you cloned. 

To run the automated pathogen build for TB, delete the output from the manual steps above and run Snakemake.

```
rm -rf results/ auspice/
snakemake
```

This command runs all of the manual steps above up through the auspice export.
As before, you can copy the resulting auspice JSON files into your auspice installation directory and confirm that you have produced the same TB site.

## Next steps

  * Learn more about [augur modules](/docs/bioinformatics/introduction)
  * Learn more about [auspice visualizations](/docs/visualisation/introduction)
  * Learn more about [creating and modifying snakemake files](/docs/pathogen-builds/snakemake)
  * Fork the [TB pathogen repository on GitHub](https://github.com/nextstrain/tb), modify the Snakefile to make your own pathogen build, and view the resulting site at `https://nextstrain.org/community/<orgName>/<repoName>` for your corresponding GitHub username/org name and repository name.

