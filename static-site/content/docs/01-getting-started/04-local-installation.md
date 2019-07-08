---
title: "Installation"
---


The following instructions describe how to install `augur` (bioinformatics tooling) and `auspice` (our visualisation app) on MacOS or an Ubuntu-style Linux distribution.
If you are using Windows, we have instructions for [installing a Linux subsystem](/docs/getting-started/windows-help) to get Nexstrain running.

> Before digging in, it's worth reading [the difference between a local & container installation](./running-locally-vs-container), both of which will install the components behind nextstrain and allow you to run and visualise analyses on your computer.



#### Table of Contents:
* [Install augur & auspice with Conda (recommended)](#install-augur--auspice-with-conda-recommended)
* [Install augur with Python](#install-augur-with-python)
* [Install auspice using npm](#install-auspice-using-npm)
* [Install augur from source](#install-augur-from-source)
* [Install auspice from source](#install-auspice-from-source)



---
## Install augur & auspice with Conda (recommended)

[Download and install the latest version of Miniconda](https://conda.io/miniconda.html) which will make the `conda` command available to you.
We're going to create a new environment called "nextstrain", which automatically installs `augur` and dependencies. We'll then install `auspice` into this environment. 


```
curl http://data.nextstrain.org/nextstrain.yml --compressed -o nextstrain.yml
conda env create -f nextstrain.yml
conda activate nextstrain
npm install --global auspice
```

and we're all done 🙌.
The beauty of this is that whenever you want to use `augur`/`auspice` you can just jump into the "nextstrain" conda environment and you're good to go!

```
conda activate nextstrain
# test things are installed / run analyses
augur -h
auspice -h
# when you're done, leave the environment
conda deactivate
```


#### Updating `augur` & `auspice`:

```
source activate nextstrain
pip install nextstrain-augur --upgrade
npm update --global auspice
```

---

## Install augur with Python

If you'd rather not use conda to manage things, then you'll have to do a bit more work!
This requires you to manage your python installation (python 3.4 or above is required).
Augur's published on [PyPi](https://pypi.org/) as [nextstrain-augur](https://pypi.org/project/nextstrain-augur), so you can install it with pip like so:

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

---
### Install auspice using npm

You'll need to have an installation of nodejs to install auspice. This can be done via conda as simply as `conda create -yn auspice nodejs=10`, or by using [nvm](https://github.com/nvm-sh/nvm) or by [installing manually](https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/).
Once this is done (check via `node --version`), then:

```
npm install --global auspice
auspice --help # to check things worked
```

---
### Install augur from source

This is useful for debugging, modifying the source code, or using an unpublished feature branch.
We're going to use conda to manage environments here, but there's a number of ways you can do this.

```
git checkout https://github.com/nextstrain/augur.git
cd augur
# create the "augur" conda environment and install dependencies
conda env create -f environment.yml
conda activate environment
pip install -e .[dev]
augur --version # test it works!
```

Note that you can use `pip install .` as the final step, but this means changes to the source code won't be reflected in your `auspice` version... which you probably want if you're going to the trouble of installing from source!

---
### Install auspice from source

This gives us the same advantages as installing augur from source 😀
Note that here i'm using conda to create an "auspice" environment with nodejs installed -- if you'd prefer to do something else then just replace those two steps.


```
git checkout https://github.com/nextstrain/auspice.git
cd auspice
conda create -yn auspice nodejs=10
conda activate auspice
npm install --global .
auspice --version # test it works!
```

Auspice should now be available everywhere, as long as you're in this environment.
Easy!
At least on MacOS, changes to the source code are reflected in this system-wide install.

