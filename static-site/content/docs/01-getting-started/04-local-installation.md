---
title: "Local Installation"
---


The following instructions describe how to install `augur` (bioinformatics tooling) and `auspice` (our visualization app) on macOS or an Ubuntu-style Linux distribution.
If you are using Windows, we have instructions for [installing a Linux subsystem](/docs/getting-started/windows-help) to get Nextstrain running.

If you have any issues with installing augur / auspice using any of these methods, please [email us](mailto:hello@nextstrain.org) or submit a GitHub issue to [augur](https://github.com/nextstrain/augur/issues) or [auspice](https://github.com/nextstrain/auspice/issues).

> Before digging in, it's worth reading [the difference between a local & container installation](/docs/getting-started/local-vs-container-install), both of which will install the components behind nextstrain and allow you to run and visualize analyses on your computer.



#### Table of Contents:
- [Install Augur & Auspice with Conda (recommended)](#install-augur--auspice-with-conda-recommended)
- [Updating `augur`, `auspice`, and `nextstrain`:](#updating-augur-auspice-and-nextstrain)
- [Install Augur with Python](#install-augur-with-python)
- [Install Auspice Using npm](#install-auspice-using-npm)
- [Install Augur from Source](#install-augur-from-source)
- [Install Auspice from Source](#install-auspice-from-source)



---
## Install Augur & Auspice with Conda (recommended)

[Download and install the latest version of Miniconda](https://conda.io/miniconda.html) which will make the `conda` command available to you.
We're going to create a new environment called "nextstrain", which automatically installs `augur` and dependencies.
We'll then install `auspice` into this environment as well and optionally setup the `nextstrain` command.


```
curl http://data.nextstrain.org/nextstrain.yml --compressed -o nextstrain.yml
conda env create -f nextstrain.yml
conda activate nextstrain
npm install --global auspice

# Optionally, if you want to use the nextstrain command
nextstrain check-setup --set-default
```

and we're all done 🙌.
The beauty of this is that whenever you want to use `Augur`/`Auspice` you can jump into the `Nextstrain` Conda environment and you're good to go!

```
conda activate nextstrain

# Test things are installed / run analyses
augur -h
auspice -h
nextstrain -h

# When you're done, leave the environment
conda deactivate
```


## Updating `augur`, `auspice`, and `nextstrain`:

```
source activate nextstrain
pip install --upgrade nextstrain-augur nextstrain-cli
npm update --global auspice
```

---

## Install Augur with Python

If you'd rather not use Conda to manage things, then you'll have to do a bit more work!
This requires you to manage your Python installation (Python 3.4 or above is required).
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
## Install Auspice Using npm

You'll need to have an installation of Node.js to install Auspice. This can be done via Conda as simply as `conda create -yn auspice nodejs=10`, or by using [nvm](https://github.com/nvm-sh/nvm) or by [installing manually](https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/).
Once this is done (check via `node --version`), then:

```
npm install --global auspice
auspice --help # to check things worked
```

---
## Install Augur from Source

This is useful for debugging, modifying the source code, or using an unpublished feature branch.
Similar to [installing Augur with python](#install-augur-with-python) you'll need a copy of python and the required dependencies.

We're going to use Conda to manage environments here, but there's a number of ways you can do this.

```
# Clone the GitHub repo
git checkout https://github.com/nextstrain/augur.git
cd augur

# Make sure Python & dependencies are installed.

# If you'd like to use the "Augur" pre-made Conda environment then:
conda env create -f environment.yml
conda activate augur

# Install Augur from source
pip install -e .[dev]

# Test it works!
augur --version
```

Note that you can use `pip install .` as the final step, but this means changes to the source code won't be reflected in your `auspice` version... which you probably want if you're going to the trouble of installing from source!

---
## Install Auspice from Source

This gives us the same advantages as installing Augur from source 😀 Note that here we're using Conda to create an "Auspice" environment with Node.js installed -- if you'd prefer to do something else then just replace those two steps.


```
# Use Conda to create an environment with nodejs 10
conda create -yn auspice nodejs=10
conda activate auspice

# Grab the GitHub Auspice repo
git checkout https://github.com/nextstrain/auspice.git
cd auspice

# Install using npm
npm install --global .

# Test it works
auspice --version
auspice --help
```

Auspice should now be available everywhere, as long as you're in this environment.
At least on macOS, changes to the source code are reflected in this system-wide install.