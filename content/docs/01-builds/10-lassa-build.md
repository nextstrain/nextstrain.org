---
author: "Trevor Bedford, James Hadfield"
date: "04/20/2018"
---

# Lassa build.
This build is temporary and in the process of being moved to a more recent version of sacra.

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

### ViPR data

* Navigate to `sacra/`
* `git checkout lassa` (i.e. do not use the master branch)
* Load `NCBI_EMAIL` environment variable by running `source environment_rethink.sh`
* Parse with `python src/run.py --files input/vipr_lassa.fasta --outfile output/vipr_lassa.json --pathogen lassa`
* This results in the file `output/lassa.json`

### ISTH-BNITM-PHE data.
* `git checkout lassa2`
* Files needed:
  * `input/lassaMeta.txt` (might need `/\r/\n/g`)
  * [github sequences](https://github.com/ISTH-BNITM-PHE/LASVsequencing) via `cd input && git clone git@github.com:ISTH-BNITM-PHE/LASVsequencing.git`
  * Note that the 2014-2017 sequences aren't in the metadata file.
* `python src/run.py --files input/LASVsequencing/2018.SSegment.fasta --outfile output/LASV.2018.SSegment.json --pathogen lassa -c segment:S country:nigeria authors:ISTH-BNITM-PHE --skip_entrez`
* `cp input/LASVsequencing/Ehichioya.SSegment.fas input/LASVsequencing/Ehichioya.SSegment.fasta`
* `python src/run.py --files input/LASVsequencing/Ehichioya.SSegment.fasta --outfile output/LASV.Ehichioya.SSegment.json --pathogen lassa -c segment:S country:nigeria authors:ISTH-BNITM-PHE --skip_entrez`

* `python src/run.py --files input/LASVsequencing/2018.LSegment.fasta --outfile output/LASV.2018.LSegment.json --pathogen lassa -c segment:L country:nigeria authors:ISTH-BNITM-PHE --skip_entrez`
* `cp input/LASVsequencing/Ehichioya.LSegment.fas input/LASVsequencing/Ehichioya.LSegment.fasta`
* `python src/run.py --files input/LASVsequencing/Ehichioya.LSegment.fasta --outfile output/LASV.Ehichioya.LSegment.json --pathogen lassa -c segment:L country:nigeria authors:ISTH-BNITM-PHE --skip_entrez`

* these sequences have no metadata: must ignore
  * `cp input/LASVsequencing/2014-2017.SSegment.txt input/LASVsequencing/2014-2017.SSegment.fasta`
  * `python src/run.py --files input/LASVsequencing/2014-2017.SSegment.fasta --outfile output/LASV.2014-2017.SSegment.json --pathogen lassa -c segment:S country:nigeria authors:ISTH-BNITM-PHE --skip_entrez`



## Upload to / download from flora

* Navigate to `flora/`
* Load enviroment variables by running `source environment_rethink.sh`
* Upload to flora with `python scripts/run.py --db lassa upload --filename ../sacra/output/vipr_lassa.json`
  * For ISTH-BNITM-PHE use:
  * `python scripts/run.py --db lassa upload --filename ../sacra/output/LASV.2018.SSegment.json`
  * `python scripts/run.py --db lassa upload --filename ../sacra/output/LASV.Ehichioya.SSegment.json`
  * `python scripts/run.py --db lassa upload --filename ../sacra/output/LASV.2018.LSegment.json`
  * `python scripts/run.py --db lassa upload --filename ../sacra/output/LASV.Ehichioya.LSegment.json`

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
