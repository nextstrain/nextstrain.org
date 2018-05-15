---
title: "Install instructions"
date: "2018-05-12"
---

To run local builds of Nextstrain, you will need two main software components. These are the [augur bioinformatic pipeline](/docs/bioinformatics-pipeline/introduction) and the [auspice visualization app](/docs/auspice/introduction).

Throughout the docs, we assume that Nextstrain components are sister directories. We would recommend placing them as children of a `nextstrain/` parent directory.

```
mkdir nextstrain
```

## Install augur

To install augur, clone the git repository and its submodules

```
cd nextstrain/
git clone https://github.com/nextstrain/augur.git
cd augur
git submodule update --init
```

Augur requires Python 2.7 to run. Your version of Python can be confirmed by running `python --version`.

Augur has a number of python dependencies that are listed in `requirements.txt` and are best installed via a package manager like conda or pip.

```
pip install -r requirements.txt
```

In addition, augur needs working installations of [mafft](https://mafft.cbrc.jp/alignment/software/) globally accessible as `mafft` and one of the following tree builders:
  * DEFAULT: [RAxML](https://sco.h-its.org/exelixis/web/software/raxml/index.html). You'll probably need to create a symlink `raxml -> raxmlHPC` because augur expects an globally accessible executable named `raxml`.
  * OPTIONAL: [FastTree](http://www.microbesonline.org/fasttree/), accessible as `fasttree`.
  * OPTIONAL: [IQ-TREE](http://www.iqtree.org/), accessible as `iqtree`.

## Install auspice

To install auspice, clone the git repository

```
cd nextstrain/
git clone https://github.com/nextstrain/auspice.git
cd auspice
```

You'll need Node.js to run auspice. You can check if node is installed with `node --version`. With Node.js present you can install auspice with

```
npm install
```

You can then run auspice locally by running `npm start` and opening a browser to [http://localhost:4000](http://localhost:4000/).
