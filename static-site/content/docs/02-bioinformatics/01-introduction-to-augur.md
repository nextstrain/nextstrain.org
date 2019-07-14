---
title: "Augur: Nextstrain's Bioinformatics Toolkit"
---

Nextstrain's bioinformatics toolkit is called __augur__.
It is a core part of the Nextstrain ecosystem used by all of our [pathogen builds](/docs/tutorials), and all source code is available on [GitHub](https://github.com/nextstrain/augur). 

Augur provides ways to perform common bioinformatics tasks through a collection of commands which are designed to be composable into larger processing pipelines.
This means the commands work well both independently and together, embracing the [philosophy of composability](https://en.wikipedia.org/wiki/Composability).


We've used `augur` to analyze a bunch of different pathogens -- from viruses with tiny genomes like [zika](/docs/tutorials/zika), to bacterial genomes orders-of-magnitude bigger like [tuberculosis](/docs/tutorials/tb).
Check out the tutorials (via the sidebar to the left) to see which components we used in each one.

Since we built it to be composable, it's easy to use other code or software to replace steps (or multiple steps!).
Similarly, not all available commands are applicable -- nor scientifically valid -- for different pathogen analyses.
We've used BEAST to replace multiple augur commands, but still visualize the results in auspice. 
It's also common to have additional scripts which are called in-between different components; reading the different tutorials should give you a feel for how powerful these can be, and how versatile your builds can be!


### Explore in more depth:

* Learn more about [each augur command](augur-commands).

* Learn more about the [data formats augur uses & produces](data-formats).

* See [how augur commands are used in our Zika build](../tutorials/zika).


