---
title: "Modular Augur"
date: "2018-06-13"
---

Modular augur aims to break apart the relevant tasks into simple layers which can be called by a build script such as snakemake.

> This approach is in development, and is now working for zika, and the aim is to move all pathogens over to this as soon as possible.


## Installing

Dependencies for modular augur are described in the file `setup.py` and can be installed with:

```bash
pip3 install --process-dependency-links .
```

## Running builds

This should be as simple as running the snakemake file in the relevant build directory, e.g. `snakemake auspice/zika_tree.json`.
Don't forget to switch into the correct conda environment via `source activate nextstrain`.

## Developing

The main problem with developing is that the snakefile (which runs each pathogen), sources augur (and treetime) from the system path.
It is probably possible to change the snakemake file to access augur via the local `bin` directory, and to make `bin/augur` access the local augur module
by adding `sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..")) ` (or similar) at the top of the script.
The easiest method we've found so far is to simply rebuild the system augur after modifying the source code -- `python setup.py install` -- this only takes a second or two.
