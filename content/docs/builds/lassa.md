---
title: "Lassa build"
author: "Trevor Bedford"
order: 1
date: "04/11/2018"
type: "docs"
chapter: "builds"
---

# Lassa build

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
* This results in the file `output/lassa.json`

## Upload to / download from flora

* Navigate to `flora/`
* Load enviroment variables by running `source environment_rethink.sh`
* Upload to flora with `python scripts/run.py --db lassa upload --filename ../sacra/output/lassa.json`
* Download segment S FASTA with `python scripts/run.py --database lassa download --outformat fasta -f data/lassa_s.fasta --segment S`
* Download segment L FASTA with `python scripts/run.py --database lassa download --outformat fasta -f data/lassa_l.fasta --segment L`

## Build with augur

* Navigate to `augur/builds/lassa/`
* Run `python lassa.prepare.py`
* This creates the files `prepared/lassa_s.json` and `prepared/lassa_l.json`
* Run `python lassa.process.py --json prepared/lassa_s.json`
* Run `python lassa.process.py --json prepared/lassa_l.json`

## Push to S3

* Navigate to `augur/`
* Load enviroment variables by running `source environment_aws.sh`
* Deploy to staging with `python scripts/s3.py push nextstrain-staging builds/lassa/auspice/lassa_*`
* Deploy live with `python scripts/s3.py push nextstrain-data builds/lassa/auspice/lassa_*`
