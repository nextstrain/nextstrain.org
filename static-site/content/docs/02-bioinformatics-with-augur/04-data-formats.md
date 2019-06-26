---
title: "Format of files used and created by augur"
---

## node-data JSONs

These files are produced by many different augur commands to store data for nodes in the tree (often including internal nodes).
Encoding this information in a seperate file allows us to keep the tree as a common newick tree which can be visualised & parsed by many different tools.
These files are JSON files with the to level property name "nodes", itself an object with property names representing nodes on the tree.
The encoding of information for each node varies depending on the augur command.
Generally, `augur export` will gather all the information for each node, from various node-data JSON files, and export this as "trait" attributes for different nodes, allowing auspice to visualise this.

Certain reserved property names (as attributes of nodes) are interpreted as exceptions by `augur export`:
* `augur translate`: "aa_muts", "aa_sequences"
* `augur ancestral`: "muts", "sequence"
* `augur refine`: "branch_length", "numdate", "clock_length", "mutation_length", "date", "num_date_confidence"
* property names ending in "_confidence" or "_entropy" will also be interpreted specially.


Additionally, certain top-level property names may be produced.
Most of the time these are used as comments or information not used by `augur export`, with the following exceptions:
* `augur translate`: "annotations"

## metadata TSV

TODO

## exported JSON(s) for auspice

We use JSONs as the interchange file format between Augur (the bioinformatics tooling) and Auspice (the visualisation app).
JSONs are reasonably easy for humans to read, easy to parse in most languages, and easy to extend.
Note that any compatible JSONs can be used by Auspice, not just those produced by Augur.
Augur produces these JSONs via the `augur export` command -- [see here for more details](augur-commands). 

### v2 (unified) JSON
_watch this space!_


### v1 (meta + tree) JSONs

> JSONs in these formats are soon-to-be deprecated.
However auspice will continue to support them for the forseeable future, and augur will maintain the ability to export them!
Using the v2 (unified) JSON will allow more customisation and functionality of how auspice visualises things :)


##### `<build_name>_tree.json`

The tree structure is encoded as a deeply nested JSON object, with traits (such as country, divergence, collection date, attributions etc) stored on each node.
The presence of a `children` property indicates that it's an internal node and contains the child objects.

See [the JSON schema](https://github.com/nextstrain/augur/blob/master/augur/data/schema_tree.json) for more details.

##### `<build_name>_meta.json`
Additional data to control and inform the visualisation is stored via the `metadata` property (key) at the top level of the JSON.

See [the JSON schema](https://github.com/nextstrain/augur/blob/master/augur/data/schema_meta.json) for more details.

##### vaidation
`augur validate` can check JSON(s) against the schemas. [See here for more details](augur-commands).
