---
title: "Contributing to Documentation"
---

Documentation is crucial to a project's success, but often painful to write!
We're always trying to improve our documentation here and would appreciate any and all contributions, whether you are a collaborator or simply a user.

### Where documentation lives

The docs you are reading here on nextstrain.org provide information on how the nextstrain.org website works.

Augur and Auspice are tools we use to power nextstrain.org, and so they are introduced here in these docs. However, they are their own projects, with their own documentations and we make an effort to keep detailed usage documentation for each of those tools in their respective documentations:
* [Augur docs](https://nextstrain-augur.readthedocs.io/en/stable/index.html)
* [Auspice docs](https://nextstrain.github.io/auspice/introduction/overview)

 If you are interested in contributing to the documentation for the _Augur or Auspice_ projects, check out the [nextstrain general contributing guide](https://github.com/nextstrain/.github/blob/master/CONTRIBUTING.md#contribute-documentation).  The rest of this document describes contributing to these nextstrain.org docs.
 
 > If you are not sure which repository your docs contribution belongs in, make your best guess and open a pull request on [Github](https://github.com/nextstrain/.github/blob/master/CONTRIBUTING.md); we can discuss it there and you will be doing us a favor by describing your point of confusion.

### Built from Markdown Files

Each page in this documentation website ([nextstrain.org/docs](/docs)) is built from a Markdown file -- for instance [here's the file for this page](https://github.com/nextstrain/nextstrain.org/blob/master/static-site/content/docs/05-contributing/03-documentation.md).


> If you're new to Markdown, [here's a good guide](https://guides.github.com/features/mastering-markdown/) and [here's a cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) which is really useful to refer to.


### Stored on GitHub

The [nextstrain.org GitHub repository](https://github.com/nextstrain/nextstrain.org) contains all the code and content which is used to build [nextstrain.org](https://nextstrain.org).
Each time the "master" branch is changed, the website will automatically rebuild, so in order to redeploy any changes, all that has to happen is to push to master 🙌

---

### Building the Documentation Locally

Before we can edit documentation, it's always helpful to be able to build the website locally.
This allows us to see changes as we make them and ensure everything looks as we want it to!
While this isn't strictly necessary, you could just edit the Markdown files and push them up, it will help avoid errors.

Prerequisites:
* `nodejs` version 10

If you use `conda` you can grab these via
```
conda create -n nextstrain.org nodejs=10
```


The documention is all within the "static-site" part of nextstrain.org, and we can install is as follows:

```bash
## step 1: clone the nextstrain.org repo
git clone https://github.com/nextstrain/nextstrain.org.git
## step 2: activate the conda environment
conda activate nextstrain.org
## step 3: install dependencies
cd nextstrain.org/static-site
npm install
```

You should now be able to run the static-site part of the website, which includes the splash page and all the documentation.
(It doesn't include Auspice, which is what we use to visualise datasets. [See here](https://github.com/nextstrain/nextstrain.org#build-nextstrainorg-locally) for how to accomplish this.)
We will run this in development mode, which allows us to update the Markdown files and have the results instantly update in the browser:

```
npm run develop
```
Then open the webpage it indicates, which is usually [localhost:8000](http://localhost:8000).


Further information, including troubleshooting, [is available in the GitHub repo](https://github.com/nextstrain/nextstrain.org/tree/master/static-site).

---

### Where Are These Markdown Files?

Once you've got things up and running we can now actually make some edits!
The documentation Markdown files are all found in `./static-site/content/docs/` -- there you'll see a number of folders which correspond to the categories you can see in the left hand side right now 👈. When we wrote these docs, they were:
```
01-getting-started
02-bioinformatics
03-tutorials
04-interpretation
05-contributing
06-narratives
```
> The numeric prefix isn't displayed, but it defines the order of the categories. This will be the same for the files representing each page (see below).

Inside each of these "category" folders, you will see the Markdown files for each page -- for instance, here's the contents of `01-getting-started`:
```
01-introduction.md
02-quickstart.md
03-local-vs-container-install.md
04-local-installation.md
05-container-installation.md
06-windows-help.md
figures/
```

If you read each one you'll see they represent the docs on nextstrain.org!
If you are running the site locally in development mode (see above) then you can try editing the contents of one of these and you should see it update in the browser 🤩

---

### Changing Existing Pages

All that's needed is to find the Markdown file corresponding to the page and edit it.
Once you're happy with things, you can push the changes up to nextstrain.org (see below).

### Adding Pages

It's similar to changing existing pages -- but first you'll need to create the markdown file.
For instance, if we wanted to add a new page to the "getting started" section from above, we could make the file `01-getting-started/07-something-new.md` which would then be visible to you locally at [localhost:8000/docs/getting-started/something-new](http://localhost:8000/docs/getting-started/something-new) and, once deployed, at [nextstrain.org/docs/getting-started/something-new](/docs/getting-started/something-new).

In the new file, you'll need to first create some metadata at the top of the file which defines the title of the page. For instance, the metadata for this file/page is:

```
---
title: "Contributing to Documentation"
---
```

Once this is done, you can begin to write the page's content.

---

### Pushing Changes Live

Nextstrain.org is automatically redeployed anytime there's a change to the master branch on GitHub.
We encourage a pull request with proposed changes, which can then be merged into master once someone has taken a look.
