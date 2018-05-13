---
title: "Data cleaning with sacra"
date: "2018-05-12"
---

The sacra module of Nextstrain is used to clean and canonicalize pathogen sequence data. It replaces functionality previously found in fauna. Sacra code is hosted at [github.com/nextstrain/sacra](https://github.com/nextstrain/sacra).
**Sacra is currently under development and not production ready.**

Fauna remains our working codebase to clean and canonicalize FASTA and Genbank files. It's somewhat unwieldy and requires [RethinkDB](https://www.rethinkdb.com/) to run. Please see [github.com/nextstrain/fauna](https://github.com/nextstrain/fauna) for instructions on use of fauna. We planning to migrate from fauna to sacra over the course of summer 2018.

# Sacra overview

The general idea is to take possibly messy* data of varying input types (FASTA, CSV, JSON, accession numbers, titer tables), collect, clean and merge the data into a JSON output.
Sacra is idempotent, i.e. `sacra(sacra(file)) == sacra(file)`.
Uploading to a database is not part of sacra (see [flora](https://github.com/nextstrain/flora)).


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
