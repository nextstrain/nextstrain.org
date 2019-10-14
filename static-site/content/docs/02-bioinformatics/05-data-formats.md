---
title: "Format of Files Used and Created by Augur"
---

#### Table of Contents:
- [Output JSON(s) for Auspice](#output-jsons-for-auspice)
    - [Tree JSON (required)](#tree-json-required)
    - [Metadata JSON (required)](#metadata-json-required)
    - [Frequency JSON (optional)](#frequency-json-optional)
- [Input files for Auspice](#input-files-for-auspice)


---
## Output JSON(s) for Auspice

We use JSONs as the interchange file format between Augur (the bioinformatics tooling) and Auspice (the visualization app).
JSONs are human-readable, parsable in most languages, and extendable.
Any compatible JSONs can be used by Auspice, not just those produced by Augur.
Augur produces these JSONs via the `augur export` command -- see the [Augur docs for more information [external link]](https://nextstrain-augur.readthedocs.io/en/stable/cli.html#export).
We also define schemas for these JSONs (see below) and provide a validation tool to check JSONs against these schemas, `auspice validate` --  see the [Augur docs for more information [external link]](https://nextstrain-augur.readthedocs.io/en/stable/cli.html#validate).


Auspice (version 2) currently requires two JSON files, with a third optional JSON.

#### Tree JSON (required)
The tree structure is encoded as a deeply nested JSON object, with traits (such as country, divergence, collection date, attributions, etc.) stored on each node.
The presence of a `children` property indicates that it's an internal node and contains the child objects.

See [the JSON schema](https://github.com/nextstrain/augur/blob/master/augur/data/schema_tree.json) for more details, or see the current [live Zika build](https://nextstrain.org/zika)'s tree JSON [here](http://data.nextstrain.org/zika_tree.json).

The filename _must_ end with `_tree.json`.

#### Metadata JSON (required)

Additional data to control and inform the visualization is stored via the `metadata` property (key) at the top level of the JSON.

See [the JSON schema](https://github.com/nextstrain/augur/blob/master/augur/data/schema_meta.json) for more details, or see the current [live Zika build](https://nextstrain.org/zika)'s metadata JSON [here](http://data.nextstrain.org/zika_meta.json).

The filename _must_ end with `_meta.json` and have the same prefix as the tree JSON above.


#### Frequency JSON (optional)

Currently this is only used by the flu builds, and generates the frequencies panel you can see at [nextstrain.org/flu](https://nextstrain.org/flu). [Here](http://data.nextstrain.org/flu_seasonal_h3n2_ha_2y_tip-frequencies.json) is an example of this file.

## Input files for Auspice
_Full information on file format requirements for Auspice and how to get your data into the correct format will be updated soon_

If you are interested in visualizing Newick trees, which is possible with CSV/TSV metadata files, then you may want to use [auspice.us](https://auspice-us.herokuapp.com/), which lets you drag and frop your files into the browser.