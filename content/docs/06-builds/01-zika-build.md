---
title: "Build steps for Zika virus"
date: "2018-05-12"
---

## Download and clean sequence data via sacra

### ViPR sequences

1. [Download sequences from ViPR](https://www.viprbrc.org/brc/vipr_genome_search.spg?method=ShowCleanSearch&decorator=flavi_zika)
  * Select year >= 2013 and genome length >= 5000
  * Download as "Genome Fasta"
  * Set Custom Format Fields to 0: GenBank Accession, 1: Strain Name, 2: Segment, 3: Date, 4: Host, 5: Country, 6: Subtype, 7: Virus Species
2. Move `<file>` of downloaded sequences to `sacra/input`
3. Upload to rethink database:
  * `python src/run.py --files input/<file> --outfile output/zika_vipr.json --pathogen zika --skip_entrez`

Creates file `zika_vipr.json` that is ready for upload to RethinkDB via flora.

### [Fred Hutch sequences](https://github.com/blab/zika-usvi/tree/master/data)

1. Move `ZIKA_USVI_good.fasta` and `ZIKA_USVI_partial.fasta` to `sacra/input`
2. Upload to rethink database:
  * `python src/run.py --files input/ZIKA_USVI_good.fasta input/ZIKA_USVI_partial.fasta --outfile output/zika_hutch.json --pathogen zika --skip_entrez --custom_fields authors:"Black et al" url:"https://github.com/blab/zika-usvi/" title:"Genetic characterization of the Zika virus epidemic in the US Virgin Islands"`
  * *Note: `custom_fields` is not yet implemented, should be working soon. For now, if a custom field is necessary a small cleaning function will need to be defined similar to [this](https://github.com/nextstrain/sacra/blob/master/configs/mumps.py#L28).*

Creates file `zika_hutch.json` that is ready for upload to RethinkDB via flora.

### Config details: `configs/zika.py`

Zika names that cannot be fixed programatically are defined in `source-data/zika_strain_name_fix.tsv`.
For all other strain names, a custom cleaning function is implemented that formats strains into `(host/)COUNTRY/ID/YEAR` format (i.e. USVI/11/2016).

By default, FASTA headers are assumed to be in the order defined above in the ViPR explanation. Other options are available by use of the command line flag `--overwrite_fasta_header <format>`.

Options for `<format> are`:
* `fauna`: useful for fastas generated via `nextstrain/fauna/vdb/zika_download`
* `sacra_rebuild`: used during initial transition from fauna to sacra
* Any other header can be defined by editing the appropriate section of `make_config` in `configs/zika.py`

## Run the modular augur pipeline

_Make sure you have enabled the correct conda environment - namely, python3 with system installs of treetime and augur_
* `cd augur/builds/zika`
* `snakemake auspice/zika_tree.json`


## Visualise locally via auspice

* copy the JSONs in `augur/builds/zika/auspice` to `auspice/data`
* in the auspice directory, run `npm run start:local`


## Push to S3
_You may need to disable the conda environment for this to work. Try running_ `source deactivate`
* Navigate to `augur/`
* Load environment variables by running `source environment_aws.sh`
* Deploy to staging with `python scripts/s3.py push --bucket nextstrain-staging --glob "builds/zika/auspice/zika_*"`
* Deploy live with `python scripts/s3.py push --bucket nextstrain-data --glob "builds/zika/auspice/zika_*"*`
