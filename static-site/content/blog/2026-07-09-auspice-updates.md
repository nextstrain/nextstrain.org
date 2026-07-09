---
author: "The Nextstrain team"
date: "2026-07-09"
title: "Auspice and auspice.us updates"
sidebarTitle: "Auspice and auspice.us updates"
---

The Nextstrain team has been focused on extending the usability of Auspice and
[auspice.us](https://auspice.us). Here are a few features that we wanted to highlight:

## Amino Acid datasets

Most Nextstrain datasets focus on nucleotide analyses, but we've had requests
from users for support of entirely amino acid analyses.
As of [Augur 33.1.0](https://github.com/nextstrain/augur/releases/tag/33.1.0) &
[Auspice 2.69.0](https://github.com/nextstrain/auspice/releases/tag/v2.69.0)
we can now run such analyses. Please see our
[Amino Acid Workflows guide](https://docs.nextstrain.org/en/latest/guides/bioinformatics/amino-acid-workflows.html)
for more details.

## User control over downloads

Nextstrain strives to make all of our data open and available and thus has made
the derived data behind visualizations available for download through Auspice.
We recognize that other data sources may not permit open data sharing, so
we've made it possible for users to control which download options are available
for their Auspice dataset. Please see our
[sharing controls](https://docs.nextstrain.org/projects/auspice/en/stable/advanced-functionality/view-settings.html#sharing-control-which-assets-auspice-exposes-for-download)
for more details.

## Download dataset JSON is created on-the-fly

When choosing to download a JSON from within Auspice we now create the JSON
dynamically rather than re-fetching it from the underlying source. This allows
[auspice.us](https://auspice.us) to use this functionality, including when
starting from newick trees, as well as containing any dragged-on metadata.
We attempt to reflect the current UI state in the downloaded dataset, so that
things like the current color-by, tree layout etc become the new defaults in
the downloaded JSON; in the future we will extend this to (e.g.) use the
current zoom state to download the subtree.

## Merging drag-and-drop metadata

The drag-and-drop metadata feature has been made more powerful by merging data
into existing colorings and supporting node data JSON files. In addition, the
merged metadata is now included in the downloaded Auspice JSON so that users
can keep a local copy of the merged dataset. For more details, please see the
[drag-and-drop extra metadata](https://docs.nextstrain.org/projects/auspice/en/stable/advanced-functionality/drag-drop-csv-tsv.html)
docs page.

## Offline use of auspice.us

We have released a new version of auspice.us that allows the site to be
used offline without an internet connection. After opening the site once with
an internet connection, you should be able to do the same while offline using the same browser.

Note this does not support the map panel since it requires internet connection to
download map tiles.

## Dataset editing in auspice.us

We have released a new version of auspice.us that allows users to edit a subset
of dataset metadata and colorings within the app. The changes are saved locally
in the brower and users must download the Auspice JSON to save the changes.
Please see our docs on [Editing Datasets](https://docs.nextstrain.org/projects/auspice/en/stable/advanced-functionality/editing-datasets.html)
for more details.
