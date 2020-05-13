---
title: "Local Installation"
---


The following instructions describe how to install `augur` (bioinformatics tooling) and `auspice` (our visualization app) on macOS or an Ubuntu-style Linux distribution.
If you are using Windows, we have instructions for [installing a Linux subsystem](/docs/getting-started/windows-help) to get Nextstrain running.

If you have any issues with installing Augur/Auspice using any of these methods, please [email us](mailto:hello@nextstrain.org) or submit a GitHub issue to [Augur](https://github.com/nextstrain/augur/issues) or [Auspice](https://github.com/nextstrain/auspice/issues).

> Before digging in, it's worth reading [the difference between a local and container installation](/docs/getting-started/local-vs-container-install), both of which will install the components behind Nextstrain and allow you to run and visualize analyses on your computer.



#### Table of Contents:
- [Install Augur & Auspice with Conda (recommended)](#install-augur--auspice-with-conda-recommended)
- [Updating `augur`, `auspice`, and `nextstrain`:](#updating-augur-auspice-and-nextstrain)
- [Install Augur with Python](#install-augur-with-python)
- [Install Augur from Source](#install-augur-from-source)
- [Install Auspice Using npm](#install-auspice-using-npm)
- [Install Auspice from Source](#install-auspice-from-source)



---
## Install Augur & Auspice with Conda (recommended)

[Download and install the latest version of Miniconda](https://conda.io/miniconda.html) which will make the `conda` command available to you.
We're going to create a new environment called "nextstrain", which automatically installs `Augur` and dependencies.
We'll then install `Auspice` into this environment as well, and optionally set up the `Nextstrain` command.


```
curl http://data.nextstrain.org/nextstrain.yml --compressed -o nextstrain.yml
conda env create -f nextstrain.yml
conda activate nextstrain
npm install --global auspice

# Optionally, if you want to use the nextstrain command
nextstrain check-setup --set-default
```

and we're all done 🙌.
The beauty of this is that whenever you want to use `augur` or `auspice` you can jump into the `nextstrain` conda environment and you're good to go!

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
conda activate nextstrain
pip install --upgrade nextstrain-augur nextstrain-cli
npm update --global auspice
```

---

## Install Augur with Python

If you'd rather not use Conda to manage things, then you'll have to do a bit more work!
This requires you to manage your Python installation (Python 3.4 or above is required).

Use [these instructions [external link]](https://nextstrain-augur.readthedocs.io/en/stable/installation/installation.html#using-pip-from-pypi) to install Augur with `pip` from [PyPi](https://pypi.org/project/nextstrain-augur).

---
## Install Augur from Source

This is useful for debugging, modifying the source code, or using an unpublished feature branch.
Similar to [installing Augur with python](#install-augur-with-python) you'll need a copy of python and the required dependencies.

Use [these instructions [external link]](https://nextstrain-augur.readthedocs.io/en/stable/installation/installation.html#install-from-source) to install Augur with `pip` from [source](https://github.com/nextstrain/augur).

Note that you can use `pip install .` as the final step, but this means changes to the source code won't be reflected in your `augur` version, which you probably want if you're going to the trouble of installing from source!

---
## Install Auspice Using npm

You'll need to have an installation of Node.js to install Auspice. This can be done via Conda as simply as `conda create -yn auspice nodejs=10`, or by using [nvm](https://github.com/nvm-sh/nvm) or by [installing manually](https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/).
Once this is done (check via `node --version`), then:

Use [these instructions [external link]](https://nextstrain.github.io/auspice/introduction/install#install-auspice-from-npm) to install Auspice with `npm`.

---
## Install Auspice from Source

This gives us the same advantages as installing Augur from source 😀 Note that here we're using Conda to create an "Auspice" environment with Node.js installed -- if you'd prefer to do something else then just replace those two steps.

Use [these instructions [external link]](https://nextstrain.github.io/auspice/introduction/install#installing-from-source) to install Auspice with `npm` from [the source code on Github](https://github.com/nextstrain/auspice).

