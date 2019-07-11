---
title: "Format of files used and created by augur"
---

> A full listing of the input and output data formats used in augur will soon be available here.



#### Table of Contents:
* [exported JSON(s) for auspice](#exported-jsons-for-auspice)


---
## exported JSON(s) for auspice

We use JSONs as the interchange file format between Augur (the bioinformatics tooling) and Auspice (the visualisation app).
JSONs are reasonably easy for humans to read, easy to parse in most languages, and easy to extend.
Any compatible JSONs can be used by Auspice, not just those produced by Augur.
Augur produces these JSONs via the `augur export` command -- see the [augur docs for more information [external link]](https://nextstrain-augur.readthedocs.io/en/stable/cli.html#export).
We also define schemas for these JSONs (see below) and provide a validation tool to check JSONs against these schemas, `auspice validate` --  see the [augur docs for more information [external link]](https://nextstrain-augur.readthedocs.io/en/stable/cli.html#validate).


Auspice (version 1.x) currently requires two JSON files, with a third optional JSON.

#### Tree JSON (required)
The tree structure is encoded as a deeply nested JSON object, with traits (such as country, divergence, collection date, attributions etc) stored on each node.
The presence of a `children` property indicates that it's an internal node and contains the child objects.

See [the JSON schema](https://github.com/nextstrain/augur/blob/master/augur/data/schema_tree.json) for more details, or see the current [live zika build](https://nextstrain.org/zika)'s tree JSON [here](http://data.nextstrain.org/zika_tree.json).

The filename _must_ end with `_tree.json`.

#### Metadata JSON (required)

Additional data to control and inform the visualisation is stored via the `metadata` property (key) at the top level of the JSON.

See [the JSON schema](https://github.com/nextstrain/augur/blob/master/augur/data/schema_meta.json) for more details, or see the current [live zika build](https://nextstrain.org/zika)'s metadata JSON [here](http://data.nextstrain.org/zika_meta.json).

The filename _must_ end with `_meta.json` and have the same prefix as the tree JSON above.


#### Frequency JSON (optional)

Currently this is only used by the flu builds, and generates the frequencies panel you can see at [nextstrain.org/flu](https://nextstrain.org/flu). [Here](http://data.nextstrain.org/flu_seasonal_h3n2_ha_2y_tip-frequencies.json) is an example of this file.

