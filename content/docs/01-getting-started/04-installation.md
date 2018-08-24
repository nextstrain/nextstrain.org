---
title: "Installation"
date: "2018-08-23"
---

Nextstrain consists of a bioinformatics pipeline utility, `augur`, and a web application for data visualization, `auspice`.
The following instructions describe how to install augur and auspice on Mac OS X or an Ubuntu-style Linux distribution.
Install the following dependencies, before you begin:

* [git](https://git-scm.com/downloads)
* [Python 3](https://www.python.org/downloads/)

### Install augur and auspice with Docker

TBD.

### Install augur with Python

Install augur.

```
# Install augur.
pip3 install git+https://github.com/nextstrain/augur@master
```

Test your installation.

```
augur -h
```

To run augur, you also need to install the following dependencies.

#### Install augur dependencies on Mac OS X

If you do not have the `brew` command, [download and install the latest version of Homebrew](https://brew.sh/).

```
brew install fasttree iqtree mafft raxml
```

#### Install augur dependencies on Linux

```
apt-get install fasttree iqtree mafft raxml
```

### Install augur with Conda

If you do not have the `conda` command, [download and install the latest version of Miniconda](https://conda.io/miniconda.html) for Python 3.

Install augur and its dependencies in a new `nextstrain` environment.

```
curl -L https://tinyurl.com/y9dmtc2k > nextstrain.yaml
conda env create -n nextstrain -f nextstrain.yaml
```

Test your installation.

```
conda activate nextstrain
augur -h
```

### Install auspice

[Install Node.js](https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/) and then install auspice and its dependencies.

```
# Download auspice.
git clone https://github.com/nextstrain/auspice
cd auspice

# Install auspice dependencies.
npm install
```

Test your auspice installation by starting the server.

```
npm run dev
```
