---
title: "Sacra Introduction"
lesson: 1
chapter: 1
cover: "https://unsplash.it/400/300/?random?BoldMage"
date: "01/01/2017"
category: "tech"
type: "docs"
tags:
    - programming
    - stuff
    - other
---

# Sacra
### Sacra: a data cleaning tool designed for genomic epidemiology datasets.

Sacra is used primarily within [Nextstrain](https://github.com/nextstrain) and replaces functionality previously found in [nextstrain/fauna](https://github.com/nextstrain/fauna).
**This is under development and not production ready.**


The general idea is to take possibly messy* data of varying input types (FASTA, CSV, JSON, accession numbers, titer tables), collect, clean and merge the data into a JSON output.
Sacra is idempotent, i.e. `sacra(sacra(file)) == sacra(file)`.
Uploading to a database is not part of sacra (see [nextstrain/flora](https://github.com/nextstrain/flora)).


## Requirements
* Python 2.7 (todo: make conda stuff)

## Input file types
* FASTA
* JSON
* more to come


## How To Run
### Command line syntax
Prior to running:
* move input files into `sacra/input` (e.g.)
* make sure that directory `sacra/output` (e.g.) exists locally

Running on a `FASTA` or `JSON`:
* `python src/run.py --files INPUT_FILE_PATHS --outfile OUTPUT_JSON_PATH --pathogen PATHOGEN_NAME OTHER_ARGUMENTS`

```
optional arguments:
  -h, --help            show this help message and exit
  --debug               Enable debugging logging
  --files [FILES [FILES ...]]
                        file types: text (list of accessions), FASTA, (to do)
                        FASTA + CSV, (to do) JSON
  --pathogen PATHOGEN   This sets the config file
  --accession_list [ACCESSION_LIST [ACCESSION_LIST ...]]
                        list of strings to query genbank with
  --outfile OUTFILE
  --visualize_call_graph
                        draw a graph of calls being made
  --call_graph_fname CALL_GRAPH_FNAME
                        filename for call graph

entrez:
  --skip_entrez         Query genbank for all accessions to help clean /
                        correct metadata data

overwrites:
  --overwrite_fasta_header OVERWRITE_FASTA_HEADER
                        Overwrite the config-defined FASTA header
```

### Adding new pathogens
To performa a Sacra run on a pathogen that is not currently supported

Supported pathogens:
* Mumps
* Zika

## How To Run (testing)
* ensure you have `piglets.fasta`, `piglets_3_accessions.txt`, `mumps.vipr.fasta`, `mumps.fauna_download.fasta` in `sacra/input` (files on slack)
* `python src/run.py --files input/piglets.fasta --debug --outfile output/piglets.json --pathogen mumps --skip_entrez`
* `python src/run.py --files input/piglets_3_accessions.txt --debug --outfile output/piglets.json --pathogen mumps --skip_entrez`
* `python src/run.py --files input/mumps.vipr.fasta --debug --outfile output/piglets.json --pathogen mumps --skip_entrez --visualize_call_graph --overwrite_fasta_header alt1`
* `python src/run.py --files input/mumps.fauna_download.fasta --debug --outfile output/piglets.json --pathogen mumps --skip_entrez --overwrite_fasta_header fauna`
