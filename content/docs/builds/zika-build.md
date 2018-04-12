---
author: "Barney Potter"
date: "03/27/2018"
---

### [ViPR sequences](https://www.viprbrc.org/brc/vipr_genome_search.spg?method=ShowCleanSearch&decorator=flavi_zika)

Creates file `zika_vipr.json` that is ready for upload to rethinkdb via flora.

1. Download sequences
  * Select year >= 2013 and genome length >= 5000
  * Download as Genome Fasta
  * Set Custom Format Fields to 0: GenBank Accession, 1: Strain Name, 2: Segment, 3: Date, 4: Host, 5: Country, 6: Subtype, 7: Virus Species
2. Move `<file>` of downloaded sequences to `sacra/input`
3. Upload to rethink database:
  * `python src/run.py --files input/<file> --outfile output/zika_vipr.json --pathogen zika --skip_entrez`

### [Fred Hutch sequences](https://github.com/blab/zika-usvi/tree/master/data)

Creates file `zika_hutch.json` that is ready for upload to rethinkdb via flora.

1. Move `ZIKA_USVI_good.fasta` and `ZIKA_USVI_partial.fasta` to `sacra/input`
2. Upload to rethink database:
  * `python src/run.py --files input/ZIKA_USVI_good.fasta input/ZIKA_USVI_partial.fasta --outfile output/zika_hutch.json --pathogen zika --skip_entrez --custom_fields authors:"Black et al" url:"https://github.com/blab/zika-usvi/" title:"Genetic characterization of the Zika virus epidemic in the US Virgin Islands"`
  * *Note: `custom_fields` is not yet implemented, should be working soon. For now, if a custom field is necessary a small cleaning function will need to be defined similar to [this](https://github.com/nextstrain/sacra/blob/master/configs/mumps.py#L28).*

## Config details: `configs/zika.py`

Zika names that cannot be fixed programatically are defined in `source-data/zika_strain_name_fix.tsv`.
For all other strain names, a custom cleaning function is implemented that formats strains into `(host/)COUNTRY/ID/YEAR` format (i.e. USVI/11/2016).

By default, fasta headers are assumed to be in the order defined above in the ViPR explanation. Other options are available by use of the command line flag `--overwrite_fasta_header <format>`.

Options for `<format> are`:
* `fauna`: useful for fastas generated via `nextstrain/fauna/vdb/zika_download`
* `sacra_rebuild`: used during initial transition from fauna to sacra
* Any other header can be defined by editing the appropriate section of `make_config` in `configs/zika.py`
