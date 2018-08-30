---
title: "Format of JSON files exported by augur and consumed by auspice"
---

We use JSONs as the interchange file format between Augur (the bioinformatics tooling) and Auspice (the visualisation app).
JSONs are reasonably easy for humans to read, easy to parse in most languages, and easy to extend.
Note that any compatible JSONs can be used by Auspice, not just those produced by Augur.
Augur produces these JSONs via the `augur export` command -- see the [bioinformatics command reference](/docs/bioinformatics/commands#export) for more details.
Augur also produces a number of other results files (written to the `results/` directory by default), however these are not used by Auspice for visualisation.


> Currently we're in the process of migrating from our (v1.0) JSON format to v2.0.
At the moment, augur can produce both formats, but Auspice can only read v1.0.
They are easily differentiable as only v1.0 JSONs have separate meta & tree JSONs.
Auspice will continue to read v1.0 JSONs for the foreseeable future, but there may be slightly restricted functionality.


### Overview of structure
The tree structure is encoded as a deeply nested JSON object, with traits (such as country, divergence, collection date, attributions etc) stored on each node.
The presence of a `children` property indicates that it's an internal node and contains the child objects.


Additional data to control and inform the visualisation is stored via the `metadata` property (key) at the top level of the JSON.


Currently those two structures are encoded in separate files (v1.0), `<build_name>_meta.json` and `<build_name>_tree.json`, however v2.0 combines these into a single JSON for simplicity (`<build_name>.json`).


Some builds may use extra JSONs, such as seasonal influenza which exports frequencies as a separate JSON.
These builds are not currently run in the augur defined in these docs.
We will update this page once we have migrated this code over.


### Specifications & validation
These JSON schemas define the exact structure of the various JSON formats.
`augur validate` (see the [bioinformatics command referece](/docs/bioinformatics/commands#validate)) uses these to automatically check provided JSONs.

* Version 1.0 [tree JSON](https://github.com/nextstrain/augur/blob/master/augur/data/schema_tree.json) and [metadata JSON](https://github.com/nextstrain/augur/blob/master/augur/data/schema_meta.json)
* Version 2.0 [unified JSON](https://github.com/nextstrain/augur/blob/master/augur/data/schema.json)
