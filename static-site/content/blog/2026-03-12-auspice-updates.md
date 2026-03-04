---
author: "James Hadfield & the Nextstrain team"
date: "2026-03-12"
title: "New tree visualisations in Auspice"
sidebarTitle: "New Auspice tree visualisations"
---

With more and more genomic data available the size of phylogenetic trees being generated are growing ever larger.
This poses immediate problems for traditional phylogenetic tree representations as we have more tips to display than pixels to display them in, not to mention the computational costs involved.
Important work in this area has been done by a number of tools, especially [Taxonium](https://elifesciences.org/articles/82392).
Recent work in Auspice has been focused on displaying larger datasets whilst still conveying the important structure of the tree.
This has manifested in two big changes, which we describe in this blog post.

## **"Focus on selected" drills into the important parts of the tree**

As trees become bigger in both dimensions (e.g. temporally and number of tips), we want to see the parts of the tree we're interested in both in the context of the overall tree and drill down into them. In a 400-tip tree this is generally not an issue, but in a 4,000-tip tree it can become difficult to highlight the parts you wish to.

<div class="note">

**There's three ways we can select nodes of interest:**

<p/>

1. We can use filters (in the sidebar) to filter the nodes by genotype, metadata trait etc. (This is the approach used in the example below.)
2. We can apply date sliders if it's a temporal tree to select only those nodes in the date range.
3. We can click on a branch to zoom into the clade downstream of that branch. This both selects the child nodes of the branch as well as zooms the tree.

As you perform these actions the byline (above the tree) will indicate how many tips you have selected: "Showing XX of YY genomes ...".

**And a few different ways we can zoom into those selected samples:**

<p/>

1. Clicking on a branch both selects downstream nodes and zooms in.
2. Clicking "zoom to selected" (top right of the tree panel) zooms into the minimal clade which includes all selected nodes. This works well if your samples of interest represent the majority of that clade, but can be relatively ineffective if they don't (as shown in the example below).
3. The new "focus on selected" toggle, as described below.

P.S. Clicking "Zoom to root" (top right of the tree panel) returns us back to the entire tree view.

</div>


Let's use our [12y influenza H3N2 tree](https://nextstrain.org/seasonal-flu/h3n2/ha/12y@2026-03-04?c=clade_membership) as an example (Figure 1, top left).
Imagine we're interested in [a few clades which looked like they were growing but eventually died out](https://nextstrain.org/seasonal-flu/h3n2/ha/12y@2026-03-04?branchLabel=none&c=clade_membership&f_clade_membership=3C.2a2,3C.2a3,3C.3a,3C.3a1) (Figure 1, top right).
Previously it's been really hard to focus on these strains, as they represent ~15% of the total tips and thus occupy a similarly small fraction of the available space; and since the clade which includes them all is essentially the entire tree, "zoom to selected" doesn't help much here!
(Selecting an early time slice in the tree was another common situation with the same issues.)


Toggling on **"focus on selected"** in the sidebar [allows the selected strains to fill the viewport](https://nextstrain.org/seasonal-flu/h3n2/ha/12y@2026-03-04?branchLabel=none&c=clade_membership&f_clade_membership=3C.2a2,3C.2a3,3C.3a,3C.3a1&focus=selected) (Figure 1, bottom).
This new mode rescales the tree in both dimensions: in the horizontal direction we change the viewport to only show the temporal / divergence range encompassed by the selected nodes; in the vertical dimension we recompute the position of selected tips so that they occupy ~80% of the available space, and compress the unselected tips into the remaining space (we also don't show most of the tips above & below the selected ones).

<p/>
<div class='figure'>
<img src="/blog/img/auspice-updates-2026-focus-on-selected.png" alt="Figure1" />
    
**Figure 1.** (top left) our 12-year influenza H3N2/HA tree; (top right) selecting a few clades of interest often results in them occupying only a small portion of the viewport, with no easy way to zoom into just those clades; (bottom) toggling "focus on selected" brings these strains front and center, maximizing their appearance in the viewport.
Color indicates influenza clade and black crosses indicate vaccine strains.

</div>

Focus on selected is a _mode_, so while it's toggled you can make changes to the selected strains (filters, date sliders, zooming into clades) and the layout will update so that the (newly) selected strains continue to take up most of the available space. Sometimes it's helpful to toggle it off to see the selected strains in the context of the overall tree and then back on to focus on just those strains.


<div class="note">

Focus on selected has been around in one form or another since [version 2.59.0 (October 2024)](https://github.com/nextstrain/auspice/releases/tag/v2.59.0). Originally it simply zoomed in the vertical dimension, but since [version 2.68.0 (January 2026)](https://github.com/nextstrain/auspice/releases/tag/v2.68.0) it zooms in both the vertical and horizontal dimension.

</div>    


## **Streamtrees allow summation of larger datasets**

Rather than iterating on traditional tree display approaches, streamtrees break a phylogenetic tree up into partitions and display each partition as a self-contained [streamgraph](https://en.wikipedia.org/wiki/Streamgraph), replacing the branching patterns in the tree with a summary of the strains involved.
This allows a higher-level overview of the pathogen's evolution, focusing on which parts of the evolutionary tree are growing and how they are related to each other, whilst still conveying how metadata traits are distributed across these trees.

Streamtrees is a visualisation mode which can be toggled on in the sidebar similarly to the "focus on selected" mode discussed above.
You can go between streamtree view and normal tree layout with this toggle; this is especially useful when you've zoomed into a single streamtree (we may make this the automatic behaviour in the future).

<div class='figure'>
<img src="/blog/img/auspice-updates-2026-streams-explained.png" alt="How streamtrees work" />

**Figure 2: How streamtrees work.** The left hand side shows a traditional rendering of the West African Ebola outbreak (2013-16), as part of our all-outbreaks [Ebola summary dataset](https://nextstrain.org/ebola/all-outbreaks?c=country&label=outbreak:Ebov-2013&streamLabel=none); colours represent Country and horizontal axis is genetic divergence. Branch labels divide these tips into the main outbreak clade (Ebov-2013) and a relapse clade (Ebov-2013/r2021, red box). 
Streamtrees (right hand side) use these branch labels to partition the data and draw each partition as a set of stacked ribbons, where each ribbon (i.e. each colour) represents the current selected metadata trait. Connecting branches link these streamtrees together, here indicating that the relapse clade is a child of the main outbreak clade.
Hovering on individual colours (ribbons) in each graph shows more information, and clicking on branches zooms in as normal.

</div>

Behind the scenes, streams are a kernel density estimate (KDE) where each tip is approximated with a Gaussian. This allows any metadata (coloring) available in the tree to be represented in streams. We go into more technical detail about the actual implementation in the [Auspice docs](https://docs.nextstrain.org/projects/auspice/en/latest/advanced-functionality/streamtrees.html).


How tips are partitioned (where each partition becomes a streamgraph) is up to the analysis pipeline, and datasets without branch labels won't be able to make use of streamtree visualisation.
Using genetic clades or lineages is a natural approach for many viruses, e.g. [seasonal-influenza](https://nextstrain.org/seasonal-flu/h3n2/ha/2y?streamLabel=Subclade_) and [SARS-CoV-2](https://nextstrain.org/ncov/open/global/all-time?streamLabel=clade); using `augur clades` will create branch labels for you by default and you can customise the branch-label key via `--label-name`.
Geographic jumps are another common way to split up the tree, and `augur traits` now has a `--branch-labels` option to do this.
In other cases, [custom code](https://github.com/nextstrain/ebola/blob/3b5d4968f65ef29c2f19bccc795c5449771d81aa/phylogenetic/all-outbreaks/Snakefile#L175-L193) may be employed such as for the all-outbreaks Ebola tree in Figure 3:


<p/>
<div class='figure'>
<img src="/blog/img/auspice-updates-2026-streams-ebov.png" alt="all Ebola outbreaks" />

**Figure 3: Streamtree of all (sequenced) Ebola outbreaks** The main figure conveys the different outbreaks and the relationship between them (horizontal axis: genomic divergence, colour: sampling year). You can zoom into different streams, and toggle between streamtrees & regular layout, as done in the bottom-right inset where we have zoomed into the recent 2025 outbreak in the DRC and want to see the detailed relationships between strains.
Note: The dataset has two different labellings for outbreaks, here we're [viewing geographic names](https://nextstrain.org/ebola/all-outbreaks?streamLabel=outbreak_geo) but there is also a [non-geographic labelling](https://nextstrain.org/ebola/all-outbreaks).

</div>


**Performance matters**

Streamtrees come into their own when looking at very large trees as they don't suffer from the same scaling problems as regular trees, both in terms of pixels and performance (Figure 4).
Taxonium's approach - a sparsification algorithm to renders a dynamically-chosen subset of nodes depending on your zoom level - is another direction to solving these problems which works stunningly well for massive trees such as [millions of SARS-CoV-2 genomes](https://taxonium.org/sars-cov-2/public?xType=x_dist). 
(P.S. Nextstrain datasets are viewable in Taxonium - click the "view in other platforms" button at the bottom of the page in Auspice to get there.)
We chose to explore streamtrees for two reasons, firstly we wanted to go beyond traditional tree rendering approaches and try to give a better big-picture overview of the evolution we are capturing, and secondly as partitioning the data opens the door to partitioning the analyses which is well suited to our bioinformatics tools and pipelines.



<p/>
<div class='figure'>
<img src="/blog/img/auspice-updates-2026-streams-big-trees.png" alt="big trees work well as streamtrees" />

**Figure 4: Big trees work well as streamtrees** Streamtrees allow us to render large trees whilst maintaining performance.
We think they provide a better way to convey relationships between important attributes in the data (e.g. clades), whilst allowing you to see the fine-grained tree structure on-demand.
Top left: 17k dengue virus strains partitioned by DENV genotype, with colour indicating geographical region, which clearly separate out the different labels which are useful for outbreak tracking; top right: the typical rendering of the same 17k tree.
Bottom left: 23k SARS-CoV-2 samples partitioned by nextstrain clade, with sampling focused on King-County (WA, USA).
The streamtree (bottom left) is simpler to understand the overall patterns in the data and interactivity remains performant whereas rendering every node (bottom right) has degraded performance and obfuscation problems meaning the big-picture relationships tend to be drowned out by the sheer number of nodes on display; dataset created as part of [Paradis et al](https://pubmed.ncbi.nlm.nih.gov/38530853/).

</div>



**Future directions**
There's many places we'd like to take streamtrees as they open up interesting visualisation ideas as well as changes to how we may analyses pathogens, especially for those where we have large amounts of sequences available.

JT McCrone & Andrew Rambaut used [a fishplot-like approach to representing uncertainty in a SARS-CoV-2 tree](https://jtmccr1.github.io/sars2/), and these may be a nice way to represent the relationship _between_ streamtrees rather than the traditional branches we currently use. 
Similar approaches have been used for clonal evolution of cancer cells, e.g. [Sandmann et al](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giad020/7113330).

Streamtrees should also scale well to more diverse datasets, such as all-influenza datasets, where streamtrees could be used to summarise the big picture relationships (e.g. between subtypes) which then transition to a more fine-grained analysis (e.g. within subtype) as we zoom in.
Partitioning datasets like this naturally allows us to split one giant analysis into multiple parts, which has benefits (parallisation) but also complications (linking, sharing data between partitions).
Exploring these directions is a focus for us over the coming years. 


<div class="note">

Streamtrees were introduced in [Auspice version 2.63.0 (June 2025)](https://github.com/nextstrain/auspice/releases/tag/v2.63.0).
They are still experimental, and feedback is welcome!
More technical information is available in [the Auspice docs](https://docs.nextstrain.org/projects/auspice/en/latest/advanced-functionality/streamtrees.html).

</div>
