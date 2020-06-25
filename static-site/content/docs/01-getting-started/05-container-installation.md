---
title: "Installing the container-based Nextstrain CLI"
---


The Nextstrain command-line tool (CLI) aims to provide access to Nextstrain components in a local environment with minimal fuss.
It uses docker containers to bundle up the installation of all the components behind Nextstrain, so that you have a clean interface and fewer installation issues!


Once you've installed the Nextstrain CLI, you can run the [quickstart guide](/docs/getting-started/quickstart) or any of the tutorials available here. 


> Before digging in, it's worth reading [the difference between a local and container installation](local-vs-container-install), both of which will install the components behind Nextstrain and allow you to run and visualize analyses on your computer.



#### Table of Contents:
* [Prerequisites](#prerequisites)
* [Install the Nextstrain CLI](#install-the-nextstrain-cli)
* [Install Docker](#install-docker)
* [Usage](#usage)
* [Development](#development)



---

## Prerequisites

### Python 3.5 or newer

This tool is written in Python 3 and requires at least Python 3.5.
There are many ways to install Python 3 on Windows, macOS, or Linux, including the [official packages](https://www.python.org/downloads/), [Homebrew](https://brew.sh) for macOS, and the [Anaconda Distribution](https://www.anaconda.com/distribution/).
Details are beyond the scope of this guide, but make sure you install Python 3.5 or higher.
You may already have Python 3 installed, especially if you're on Linux.
Check by running `python --version` or `python3 --version`.


### Git

[Git](https://en.wikipedia.org/wiki/Git_(software)) is a [version control system](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control) used by all of the Nextstrain ecosystem.
It is free to [download and install](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).


---
## Install the Nextstrain CLI

With Python 3 installed, you can use [pip](https://pip.pypa.io) to install the
[Nextstrain-CLI package](https://pypi.org/project/nextstrain-cli):

```
$ python3 -m pip install nextstrain-cli
Collecting nextstrain-cli
[…a lot of output…]
Successfully installed nextstrain-cli-1.6.1
```

After installation, make sure the `nextstrain` command works by running
`nextstrain version`:

```
$ nextstrain version
nextstrain.cli 1.6.1
```

_The version you get will probably be different than the one shown in the
example above_.

---
## Install Docker

This tool also currently requires [Docker][], which is freely available.  On
Windows or a Mac you should download and install [Docker Desktop][] (also known
as "Docker for Mac" and "Docker for Windows").  On Linux, your package manager
should include a Docker package.

[Docker]: https://docker.com
[Docker Desktop]: https://www.docker.com/products/docker-desktop

After installing Docker, run `nextstrain check-setup` to ensure it works:

```
$ nextstrain check-setup
nextstrain-cli is up to date!

Testing your setup…

✔ docker is installed
✔ docker run works

All good!
```

If the final message doesn't indicate success (as with "All good!" in the
example above), something may be wrong with your Docker installation.
Please get in touch with us [via email](mailto:hello@nextstrain.org) or create a post at [discussion.nextstrain.org](https://discussion.nextstrain.org) if this is the case!

---
## Usage

This package provides a `nextstrain` program which provides access to a few
commands.  If you've installed this package (`nextstrain-cli`), you can just
run `nextstrain`.  Otherwise, you can run `./bin/nextstrain` from a copy of the
source code.

```
usage: nextstrain [-h] {build,view,deploy,shell,update,check-setup,version} ...

Nextstrain command-line tool

optional arguments:
  -h, --help            show this help message and exit

commands:
  {build,view,deploy,shell,update,check-setup,version}
    build               Run pathogen build
    view                View pathogen build
    deploy              Deploy pathogen build
    shell               Start a new shell in the build environment
    update              Updates your local image copy
    check-setup         Tests your local setup
    version             Show version information
```

For more information on a specific command, you can run it with the `--help`
option, for example, `nextstrain build --help`.


---
## Development

Development of `nextstrain-cli` happens at [github.com/nextstrain/cli](https://github.com/nextstrain/cli).
Please see the README there for further information.


