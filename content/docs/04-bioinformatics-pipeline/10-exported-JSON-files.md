---
author: "james hadfield"
date: "09/03/2018"
---

The data displayed in auspice is derived from JSON files produced by augur.
The meta & tree JSONs are essential, whereas the frequencies JSON is optional.
This page details their format.

> Please note - the format of these JSONs are in flux

### Metadata JSON
  * `updated {str}` Displayed in the footer.
  * `author_info {obj}`
    * `key -> {title -> str, n -> int}` Displayed when clicking on strains in the tree and also for the authors filter in the footer.
  * `virus_count {int}` Total number of tips in the tree. Used in the Info panel & for CSV download.
  * `defaults {obj}` _optional_ Used to override the default view of the data. Possible keys/values are:
    * `geoResolution`
    * `colorBy`
    * `mapTriplicate {bool}`
  * `title {str}` Displayed in the header
  * `vaccine_choices {obj}` _optional_
    * `<strain_name> -> YYYY-MM-DD` The date string is currently unused, but the strain names will show up as a black cross in the tree.
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
  * `seq_author_map` _DEPRECATED_
  * `filters {ARRAY}` a list of colorBy values to use as filters in the footer. Authors should not be specified, that's added automatically. _to do - clean up_
  * `commit {str}` _currently unused because it is always "unknown", but this will be used in the future_
  * `maintainer {array}` Used in the footer. An array of name to be displayed and URL (both strings).
  * `panels {array}`
  * `geo {obj}` Keys are the values of the colorBy values that are used as map demes, and therefore appear in the geographic resolution dropdown _i'm guessing here - CHECK_. Each value is an object:
    * `{key -> {latitude: FLOAT, longitude: FLOAT}}` keys being the colorBy values.
  * `annotations {obj}` Used to create the gene map in the entropy panel. Each object has shape:
    * `{NAME -> {start: INT, end: INT, strand: INT}}` where `NAME` is the gene name or "nuc".

### Tree JSON
This has a nested format whereby the JSON describes the root node in the tree, with each child appearing as objects in the `children -> [...]` property of the node. This is the shape of each node object (including terminal nodes).
  * `tvalue {FLOAT}` _DEPRECATED_
  * `yvalue {FLOAT}` _Currently required, but will soon be calculated in auspice_
  * `xvalue {FLOAT}` _DEPRECATED_
  * `clade {INT}` Value must be unique
  * `strain {STR}` The node name - used by terminal nodes to display strain name. Must be unique.
  * `serum {STR}` _I believe this is unused in nextstrain/auspice_
  * `muts {ARRAY}` _optional_ Values are, e.g., "T399C".
  * `aa_muts {OBJ}` _optional_ Keys are gene names, values are arrays similar to above (but with amino acids)
  * `children {ARRAY}` A list of nodes such as this. Terminal nodes do not have this set. Can be more than 2 in the array (i.e. polytomies are allowed).
  * `attr {obj}` see below.

#### The `attr` key describes an object with required and optional keys.

**Required attribute keys & values**
  * `num_date {FLOAT}`
  * `div {FLOAT}` _Cumulative (root = 0, nodes are divergence from root_


**Optional attribute keys & values**
  * Each colorBy (set in the metadata) provides a key which is used as a lookup here.
  * `authors`
  * `X_confidence {MULTIPLE}` where x is a colorBy key or `num_date`.
  If `X` is `num_date` then the value is an array consisting of the min & max values to display the confidence interval bar.
  If `X` is a valid colorBy key, then the value is an object consisting of keys being values of that colorBy and values being fractions such that the sum of all values is less than 1.0. This is used to control the opacity of the branch as well as in the info-box when hovered.

**Deprecated keys & values**
  * `named_clades {ARRAY}` _DEPRECATED_
  * `strain` _DEPRECATED_ (this is set on the node itself, not in `node.attr`)

### tip frequency JSON (Optional for nextstrain.org)
```
{
  "pivots": [2015.25, 2015.333333, 2015.416667...],
  "strain_name_1": {
    "frequencies": [0.0, 0.05, ...]
    "weight": 1.0
  },
  "strain_name_2": {
    "frequencies": [0.0, 0.01, ...]
    "weight": 1.0
  }
}
```
* The Pivots array defines the x-values of the frequency stream graph
* `strain_name_1` is an actual strain name, e.g. `A/Christchurch/16/2010`
* The frequencies array length must be the same as the pivot array length
* The `weight` value is currently unused.

### sequence JSON (No longer used by nextstrain.org)
The input sequences are stored in a compressed JSON format as follows:
```
{
    root: { //the sequence inferred for the root node
        nuc: "ACGAGTGATG...",
        protein1: "KCYTWD...",
        protein2: "ASRTRTY...",
    },
    1: {   // sequences for each node in the tree (incl the root)
           // these can either be full sequences or differences relative to root
        nuc: { 135:"G", 225:"A"},
        protein1: {155: "Y"},
        ...
    },
    2: {
        ...
    },
    ...
}
```

### frequency JSON (No longer used by nextstrain.org)
```
{
    pivots: [2013, 2013.25, 2013.5 ...],     //interpolation pivots for frequency trajectories
    // identifier format: region_category:position
    "global_protein1:135Y"  : [0.0, 0.1, ...],    //frequencies at the pivots points
    "global_nuc:135G"       : [0.0, 0.1, ...],    //nucleotide mutation frequencies
    "global_clade:2"        : [0.0, 0.1, ...],   //clade frequencies
}
```
