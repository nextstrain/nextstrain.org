---
title: "Zika Tutorial"
---

This tutorial explains how to build a Nextstrain site for the Zika virus.
We will first build a site step-by-step using an example data set.
Then we will see how to automate this stepwise process by defining a pathogen build script.

If you have not already, [install augur and auspice](/docs/getting-started/installation).

Nextstrain builds typically require the following steps:

1. prepare pathogen sequences and metadata
2. align sequences
3. construct a phylogeny from aligned sequences
4. annotate the phylogeny with inferred ancestral pathogen dates, sequences, and traits
5. export the annotated phylogeny and corresponding metadata into auspice-readable format

First, download the Zika pathogen build which includes example data and a pathogen build script.

```
git clone https://github.com/nextstrain/zika-tutorial.git
cd zika-tutorial
```

## Prepare the Sequences

A Nextstrain site typically starts with a collection of pathogen sequences in a single FASTA file and a corresponding table of metadata describing those sequences in a tab-delimited text file.
For this tutorial, we will use an example data set with a subset of 34 viruses.

The virus sequences are stored in a single [FASTA](https://en.wikipedia.org/wiki/FASTA_format) file.
An example virus sequence record looks like the following, with the virus's strain id as the sequence name in the header line followed by the virus sequence.

```
>PAN/CDC_259359_V1_V3/2015
gaatttgaagcgaatgctaacaacagtatcaacaggttttattttggatttggaaacgag
agtttctggtcatgaaaaacccaaaaaagaaatccggaggattccggattgtcaatatgc
taaaacgcggagtagcccgtgtgagcccctttgggggcttgaagaggctgccagccggac
ttctgctgggtcatgggcccatcaggatggtcttggcgattctagcctttttgagattca
```

Each sequence record's virus strain id links to the tab-delimited metadata file by the latter's `strain` field.
The metadata file contains a header of column names followed by one row per virus strain id in the sequences file.
An example metadata file looks like the following.

```
strain	virus	accession	date	region	country	division	city	db	segment	authors	url	title	journal	paper_url
1_0087_PF	zika	KX447509	2013-12-XX	oceania	french_polynesia	french_polynesia	french_polynesia	genbank	genome	Pettersson et al	https://www.ncbi.nlm.nih.gov/nuccore/KX447509	How Did Zika Virus Emerge in the Pacific Islands and Latin America?	MBio 7 (5), e01239-16 (2016)	https://www.ncbi.nlm.nih.gov/pubmed/27729507
1_0181_PF	zika	KX447512	2013-12-XX	oceania	french_polynesia	french_polynesia	french_polynesia	genbank	genome	Pettersson et al	https://www.ncbi.nlm.nih.gov/nuccore/KX447512	How Did Zika Virus Emerge in the Pacific Islands and Latin America?	MBio 7 (5), e01239-16 (2016)	https://www.ncbi.nlm.nih.gov/pubmed/27729507
1_0199_PF	zika	KX447519	2013-11-XX	oceania	french_polynesia	french_polynesia	french_polynesia	genbank	genome	Pettersson et al	https://www.ncbi.nlm.nih.gov/nuccore/KX447519	How Did Zika Virus Emerge in the Pacific Islands and Latin America?	MBio 7 (5), e01239-16 (2016)	https://www.ncbi.nlm.nih.gov/pubmed/27729507
Aedes_aegypti/USA/2016/FL05	zika	KY075937	2016-09-09	north_america	usa	usa	usa	genbank	genome	Grubaugh et al	https://www.ncbi.nlm.nih.gov/nuccore/KY075937	Genomic epidemiology reveals multiple introductions of Zika virus into the United States	Nature (2017) In press	https://www.ncbi.nlm.nih.gov/pubmed/28538723
```

A metadata file must have the following columns:

  * strain
  * virus
  * date

Builds using published data should include the following additional columns, as shown in the example above:

  * accession (e.g., NCBI GenBank, EMBL EBI, etc.)
  * authors
  * url
  * title
  * journal
  * paper_url

### Filter the Sequences

Filter the parsed sequences and metadata to exclude strains from subsequent analysis and subsample the remaining strains to a fixed number of samples per group.

```
mkdir -p results/

augur filter \
  --sequences data/sequences.fasta \
  --metadata data/metadata.tsv \
  --exclude config/dropped_strains.txt \
  --output results/filtered.fasta \
  --group-by country year month \
  --sequences-per-group 20 \
  --min-date 2012
```

### Align the Sequences

Create a multiple alignment of the sequences using a custom reference.
After this alignment, columns with gaps in the reference are removed.
Additionally, the `--fill-gaps` flag fills gaps in non-reference sequences with "N" characters.
These modifications force all sequences into the same coordinate space as the reference sequence.

```
augur align \
  --sequences results/filtered.fasta \
  --reference-sequence config/zika_outgroup.gb \
  --output results/aligned.fasta \
  --fill-gaps
```

Now the pathogen sequences are ready for analysis.

## Construct the Phylogeny

Infer a phylogenetic tree from the multiple sequence alignment.

```
augur tree \
  --alignment results/aligned.fasta \
  --output results/tree_raw.nwk
```

The resulting tree is stored in [Newick format](http://evolution.genetics.washington.edu/phylip/newicktree.html).
Branch lengths in this tree measure nucleotide divergence.

### Get a Time-Resolved Tree

Augur can also adjust branch lengths in this tree to position tips by their sample date and infer the most likely time of their ancestors, using [TreeTime](https://github.com/neherlab/treetime).
Run the `refine` command to apply TreeTime to the original phylogenetic tree and produce a "time tree".

```
augur refine \
  --tree results/tree_raw.nwk \
  --alignment results/aligned.fasta \
  --metadata data/metadata.tsv \
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

## Annotate the Phylogeny

### Reconstruct Ancestral Traits

TreeTime can also infer ancestral traits from an existing phylogenetic tree and metadata annotating each tip of the tree.
The following command infers the region and country of all internal nodes from the time tree and original strain metadata.
As with the `refine` command, the resulting JSON output is indexed by strain or internal node name.

```
augur traits \
  --tree results/tree.nwk \
  --metadata data/metadata.tsv \
  --output results/traits.json \
  --columns region country \
  --confidence
```

### Infer Ancestral Sequences

Next, infer the ancestral sequence of each internal node and identify any nucleotide mutations on the branches leading to any node in the tree.

```
augur ancestral \
  --tree results/tree.nwk \
  --alignment results/aligned.fasta \
  --output results/nt_muts.json \
  --inference joint
```

### Identify Amino-Acid Mutations

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

## Export the Results

Finally, collect all node annotations and metadata and export it all in auspice’s JSON format.
The resulting tree and metadata JSON files are the inputs to the auspice visualization tool.

```
augur export \
  --tree results/tree.nwk \
  --metadata data/metadata.tsv \
  --node-data results/branch_lengths.json \
              results/traits.json \
              results/nt_muts.json \
              results/aa_muts.json \
  --colors config/colors.tsv \
  --auspice-config config/auspice_config.json \
  --output-tree auspice/zika_tree.json \
  --output-meta auspice/zika_meta.json
```

## Visualize the Results

To visualize the resulting Nextstrain site, copy the auspice files into the `data` directory of your local auspice installation, start auspice, and navigate to http://localhost:4000/local/zika in your browser.

```
# Copy files into auspice data directory.
mkdir ~/src/auspice/data/
cp auspice/*.json ~/src/auspice/data/

# Start auspice.
cd ~/src/auspice/data/
npm run dev
```

## Automate the Build with Snakemake

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

* Learn more about [augur commands](../bioinformatics).

* Learn more about [auspice visualizations](../visualisation).

* Learn more about [creating and modifying snakemake files](../pathogen-builds/snakemake).

* Fork the [Zika tutorial pathogen repository on GitHub](https://github.com/nextstrain/zika-tutorial), modify the Snakefile to make your own pathogen build, and view the resulting site at `https://nextstrain.org/community/<orgName>/<repoName>` for your corresponding GitHub username/org name and repository name.
