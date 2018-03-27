---
title: "JSON format"
author: "james hadfield"
chapter: "auspice"
order: 1
date: "09/03/2018"
type: "api"
---

The data displayed in auspice is derived from JSON files produced by augur.
The meta & tree JSONs are essential, whereas the frequencies JSON is optional.
This page details their format.

> Please note - the format of these JSONs are in flux

### Metadata JSON
  * `updated {str}` Used in the footer.
  * `author_info {obj}`
    * `key -> {title -> str, n -> int}` Displayed when clicking on strains in the tree and also for the authors filter in the footer.
  * `virus_count {int}`
  * `defaults {obj}` Used to override the default view of the data. Possible keys/values are:
    * `geoResolution`
    * `colorBy`
    * `mapTriplicate {bool}`
  * `title {str}` Displayed in the header
  * `vaccine_choices {obj}` Keys should be strain names, values are date string (YYYY-MM-DD). Used to display dotted lines between the strain collection date and a cross at this date.
  * `controls {obj}` _to do - are these used by the filters?!?! WHy is this effectively a dup of author_info_
    * `geographic location {obj}` Keys are deme names. Value is the object `{count: INT, subcats: OBJ}`. There is also a key `name -> str`.
    * `authors`
  * `color_options {obj}`  _to do_
    * `<name> -> menuItem: STR, type: STR, legendTitle: STR, key: STR, color_map: ARRAY`
    * The name is used...
    * The `type` dictates the color ramp used. Values are "ordinal", "discrete" and "continuous"
    * The `color_map` is an array of arrays, where each array has `[value, hex]`. It can only be used with discrete scales.
    * The `key`
    * The `menuItem`
  * `seq_author_map` _to do - this should be removed from the JSON_
  * `filters {ARRAY}` a list of colorBy values to use as filters in the footer. Authors should not be specified, that's added automatically. _to do - clean up_
  * `commit {str}` _currently unused_
  * `maintainer {array}` Used in the footer. An array of name to be displayed and URL.
  * `panels {array}`
  * `geo {obj}` Keys are the values of the colorBy values that are used as map demes, and therefore appear in the geographic resolution dropdown _i'm guessing here - CHECK_. Each value is an object:
    * `{key -> {latitude: FLOAT, longitude: FLOAT}}` keys being the colorBy values.
  * `annotations {obj}` Used to create the gene map in the entropy panel. Each object has shape:
    * `{NAME -> {start: INT, end: INT, strand: INT}}` where `NAME` is the gene name or "nuc".

### Tree JSON
This has a nested format whereby the JSON describes the root node in the tree, with each child appearing as objects in the `children -> [...]` property of the node. This is the shape of each node object (including terminal nodes).
  * `tvalue {FLOAT}` _I believe this is not used (attr.num_date is)_
  * `yvalue {FLOAT}` _this will be removed soon and calculated in auspice_
  * `xvalue {FLOAT}` The divergence of the node from the root (which is 0.0) _I don't think this is actually used - it's attr.div that gets used?_
  * `clade {INT}` Value must be unique
  * `strain {STR}` The node name - used by terminal nodes to display strain name. Must be unique.
  * `serum {STR}` _I believe this is unused in nextstrain/auspice_
  * `muts {ARRAY}` Values are, e.g., "T399C"
  * `aa_muts {OBJ}` Keys are gene names, values are arrays similar to above (but with amino acids)
  * `children {ARRAY}` A list of nodes such as this. Terminal nodes do not have this set. Can be more than 2 in the array (i.e. polytomies are allowed).
  * `attr {obj}` see below.

The `attr` key describes an object with required and optional keys.

**Required attribute keys & values**
  * `num_date {FLOAT}` _I believe this is used to display the temporal tree_
  * `div {FLOAT}` _I believe this is used to display the non-temporal tree_
  Each


**Optional attribute keys & values**
  * Each colorBy (set in the metadata) provides a key which is used as a lookup here.
  * `authors`
  * `X_confidence {MULTIPLE}` where x is a colorBy key or `num_date`.
  If `X` is `num_date` then the value is an array consisting of the min & max values to display the confidence interval bar.
  If `X` is a valid colorBy key, then the value is an object consisting of keys being values of that colorBy and values being fractions such that the sum of all values is less than 1.0. This is used to control the opacity of the branch as well as in the info-box when hovered.
  * `named_clades {ARRAY}` _deprecated_
  * `clade_annotation {STR}` _this may change_


### Frequencies JSON

  * `pivots {ARRAY}` An array of dates (year as a float). The length of this must be the same as the length of each tip frequency.
  * `STRAIN_NAME {OBJ}` Must match a tip in the tree. Keys:
    * `weight {FLOAT}` _not yet used in auspice_
    * `frequencies {ARRAY}` An array of the tip frequencies over the times defined in the pivots array.
