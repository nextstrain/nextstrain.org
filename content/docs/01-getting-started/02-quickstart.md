---
title: Quickstart
date: "2018-08-23"
---

This guide uses the [Nextstrain command-line interface (CLI) tool](https://github.com/nextstrain/cli) to help you quickly get started running and viewing pathogen builds in Nextstrain with a minimum of fuss.
It assumes you are comfortable using the command line and installing software on your computer.
If you need help when following this guide, please reach out by [emailing us](mailto:hello@nextstrain.org?subject=Quickstart%20help).

When you're done following this guide, you will have built a local version of [our live Zika analysis](https://nextstrain.org/zika) and viewed the results on your computer.
You'll have a basic understanding of how to run builds for other pathogens and a foundation for understanding the Nextstrain ecosystem in more depth.

## Set up your computer

Before you can do anything else, you need to set up your computer to run the Nextstrain CLI.

### Install Python 3

Python 3.5 or higher is required.
There are many ways to install Python 3 on Windows, macOS, or Linux, including the [official packages](https://www.python.org/downloads/), [Homebrew](https://brew.sh) for macOS, and the [Anaconda Distribution](https://www.anaconda.com/distribution/).  
Details are beyond the scope of this guide, but make sure you install Python 3.5 or higher.

You may already have Python 3 installed, especially if you're on Linux.  Check by running `python3 --version`:

    $ python3 --version
    Python 3.6.5

### Install the Nextstrain CLI

With Python 3 installed, you can use [pip](https://pip.pypa.io) to install the [nextstrain-cli package](https://pypi.org/project/nextstrain-cli):

    $ pip3 install nextstrain-cli
    Collecting nextstrain-cli
    […a lot of output…]
    Successfully installed nextstrain-cli-1.4.1

After installation, make sure the `nextstrain` command works by running `nextstrain version`:

    $ nextstrain version
    nextstrain.cli 1.4.1

The version you get will probably be different than the one shown in the example above.

### Install Docker Community Edition (CE)

The Nextstrain CLI tool also currently requires [Docker](https://docker.com).
You can download and install the [Docker Community Edition (CE)](https://www.docker.com/community-edition#download) for your platform for free.

After installing Docker CE, run `nextstrain check-setup` to ensure it works:

    $ nextstrain check-setup
    nextstrain-cli is up to date!

    Testing your setup…

    ✔ docker is installed
    ✔ docker run works

    All good!

If the final message doesn't indicate success (as with "All good!" in the example above), something may be wrong with your Docker installation.

### Download the Nextstrain environment image

The final part of the set up is running `nextstrain update` to download the latest [Nextstrain environment image](https://github.com/nextstrain/docker-base) used by the CLI:

    $ nextstrain update
    nextstrain-cli is up to date!

    Updating Docker image nextstrain/base…
    […a lot of output…]
    Your images are up to date!

You can re-run this command in the future to get updates to the Nextstrain environment.

### Optionally: Install git

[git](https://en.wikipedia.org/wiki/Git_(software)) is a [version control system](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control) used by all of the Nextstrain ecosystem.
It is free to [download and install git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

While git is not required to use this guide, it is recommended and _will_ be necessary for taking your next steps after this guide.

## Download the nextstrain/zika repository

Now that you're set up, it's time to download the [Zika pathogen repository](https://github.com/nextstrain/zika) you're going to build.  

If you have git installed, clone the repository we use to keep track of changes to our analysis:

    $ git clone https://github.com/nextstrain/zika
    Cloning into 'zika'...
    […more output…]

When it's done, you'll have a new directory called `zika/`.

If you don't have git installed and want to skip installing it for now, you can instead download [a snapshot of the repository in a zip file](https://github.com/nextstrain/zika/archive/master.zip).
After unzipping the snapshot, you'll need to rename the resulting `zika-master/` directory to just `zika/` to match the rest of this guide.

## Run the build

Running the [augur bioinformatics pipeline](/docs/bioinformatics) encompasses subsampling data, aligning sequences, building a phylogeny and estimating phylogeographic patterns and saving the results in a format suitable for [visualization with auspice](/docs/visualisation).

You'll run the build with an example data set which is quite a bit smaller than the full dataset in order to save time.
Copy the provided example data into place:

    $ mkdir -p zika/data/
    $ cp zika/example_data/zika.fasta zika/data/

Then run `nextstrain build zika/` to run the build:

    $ nextstrain build zika/
    Building DAG of jobs...
    […a lot of output…]

Output files will be in the directories `zika/data/`, `zika/results/` and
`zika/auspice/`.

## Visualize build results

Now you can run `nextstrain view zika/auspice/` to view the build results using Nextstrain's visualizations:

    $ nextstrain view zika/auspice/
    ——————————————————————————————————————————————————————————————————————————————
        The following datasets should be available in a moment:
           • http://127.0.0.1:4000/local/zika
    ——————————————————————————————————————————————————————————————————————————————
    […more output…]

[Open the link shown](http://127.0.0.1:4000/local/zika) in your browser.

![Screenshot of Zika example dataset viewed in Nextstrain](figures/zika_example.png)

## Next steps

* Learn more [about the Zika build](zika-tutorial).

* Learn more about the CLI by running `nextstrain --help` and `nextstrain <command> --help`.

* Explore the Nextstrain environment by running ad-hoc commands inside it using `nextstrain shell zika/`.
