---
title: "Installation"
---

Nextstrain consists of a bioinformatics pipeline utility, `augur`, and a web application for data visualization, `auspice`.
The following instructions describe how to install augur and auspice on MacOS or an Ubuntu-style Linux distribution.
If you are using Windows, we have instructions for [installing a Linux subsystem](/docs/getting-started/windows-help) to get Nexstrain running.

We recommend using conda to manage environments, however there are other options (see below).

### Prerequisites

You'll need the following installed before you begin:

* [git](https://git-scm.com/downloads)
* [Python 3](https://www.python.org/downloads/) TODO -- do you need this to install conda?!?


### Install augur with Conda (recommended)

[Download and install the latest version of Miniconda](https://conda.io/miniconda.html) which will make the `conda` command available to you.
We're going to create a new environment called "nextstrain", where we'll install `augur` and `auspice`

TODO -- create a yml file for both augur + auspice & store on data.nextstrain.org


```
curl -L https://tinyurl.com/y9dmtc2k > nextstrain.yaml # TODO
conda env create -n nextstrain -f nextstrain.yaml
```

This has created the "nextstrain" environment, and installed augur and auspice into it.
Simply activate this environment anytime you wish to use these programs:

```
conda activate nextstrain
augur -h
auspice -h
```

##### Updating `augur` & `auspice` using conda:

TODO



### Install augur with Python

This requires you to manage your python installation (python 3.4 or above is required). Augur's published on [PyPi](https://pypi.org/) as [nextstrain-augur](https://pypi.org/project/nextstrain-augur), so you can install it with pip like so:

```
python -m pip install nextstrain-augur
```

Test your installation.

```
augur -h
```

Augur uses some common external bioinformatics programs which you’ll need to install to have a fully functioning toolkit.
* `augur align` requires `mafft`
* `augur tree` requires at least one of
  * [IQ-TREE](http://www.iqtree.org/) (used by default)
  * [RAxML](https://sco.h-its.org/exelixis/web/software/raxml/) (optional alternative)
  * [FastTree](http://www.microbesonline.org/fasttree/) (optional alternative)
* Bacterial data (or any VCF usage) requires [vcftools](https://vcftools.github.io/)


On macOS, you can install these external programs using Homebrew with:

```
brew install mafft iqtree raxml fasttree vcftools
```

On Debian/Ubuntu, you can install them via:

```
sudo apt install mafft iqtree raxml fasttree vcftools
```

Other Linux distributions will likely have the same packages available, although the names may differ slightly.


### Install auspice using npm

You'll need to have an installation of nodejs to install auspice. This can be done via conda:
```
# create the "auspice" conda environment, with nodeJS
conda create -yn auspice nodejs=10
conda activate auspice
```
or by using [nvm](TODO) or by [installing manually](https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/).
Once this is done (check via `node --version`), then:

```
npm install --global auspice
auspice --help # to check things worked
```

### Install augur from source

This is useful for debugging, modifying the source code, or using an unpublished feature branch.
We're going to use conda to manage environments here, but there's a number of ways you can do this.

```
git checkout TODO
cd augur
# create the "augur" conda environment and install dependencies
conda env create -f environment.yml
conda activate environment
pip install -e .[dev]
augur --version # test it works!
```

Note that you can use `pip install .` as the final step, but this means changes to the source code won't be reflected in your `auspice` version... which you probably want if you're going to the trouble of installing from source!


### Install auspice from source

This gives us the same advantages as installing augur from source :)

```
git checkout TODO
cd auspice
# create the "auspice" conda environment, with nodeJS
conda create -yn auspice nodejs=10
conda activate auspice
npm install --global .
auspice --version # test it works!
```

Auspice should now be available everywhere, as long as you're in this environment.
Easy!
At least on MacOS, changes to the source code are reflected in this system-wide install.

