# Building Lassa

## Download data from ViPR

* [ViPR search URL](https://www.viprbrc.org/brc/vipr_genome_search.spg?method=ShowCleanSearch&decorator=arena)
* Click on "Jump to specific subfamily...", type "lassa" and select "Lassa mammarenavirus (Species)"
* Click on "Select All" by "Lassa mammarenavirus (Species)"
* Click on "Complete Sequences Only"
* Click on "Search"
* Click "Select all XXX genomes"
* Click "Download"
* Click "Genome FASTA" under "Specify Download Type"
* Click "Custom format - select fields from list"
* Click "Select All" and then click "Add"
* Click "Download"
* This downloads the file `GenomeFastaResults.zip`
* Unzip and save to `sacra/input/` as `vipr_lassa.fasta`

## Download data from Genbank

_Currently using ViPR for database download._

* [Genbank search URL](https://www.ncbi.nlm.nih.gov/nuccore/?term=lassa%5Btitle%5D+AND+viruses%5Bfilter%5D+AND+("2000"%5BSLEN%5D+%3A+"20000"%5BSLEN%5D))
* This is search fields of `measles[title] AND viruses[filter] AND ("5000"[SLEN] : "20000"[SLEN])`
* Send to : Complete Record : File : Accession List
* This downloads the file `sequence.seq`
* Open this file and remove the `.1`, `.2`, etc... from the accession numbers
* Save this file as `accesions_lassa.txt` in `sacra/input/`

## Process with sacra

* Navigate to `sacra/`
* Load `NCBI_EMAIL` environment variable by running `source environment_rethink.sh`
* Parse with `python src/run.py --files input/vipr_lassa.fasta --outfile output/lassa.json --pathogen lassa`
