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
from users for support of entirely amino acid analyses. Auspice has been updated
to work with amino acid only datasets. Please see our
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

## Merging drag-and-drop metadata

The drag-and-drop metadata feature has been made more powerful by merging data
into existing colorings and supporting node data JSON files. In addition, the
merged metadata is now included in the downloaded Auspice JSON so that users
can keep a local copy of the merged dataset.

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
