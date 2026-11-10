---
author: "The Nextstrain team"
date: "2025-04-22"
title: "Conda runtime out-of-sync"
sidebarTitle: "Conda runtime out-of-sync"
---

**Update (12 May)**: Updates to our Conda runtime have [now
resumed](/blog/2025-05-12-conda-runtime-*nsync) with version
`20250512T165820Z`.

For users of the Conda runtime, note that releases have been paused due to
a dependency resolution issue with our internal use of micromamba.
The latest release of the Conda runtime uses Augur 29.0.0, so please use other
runtimes if you need to use the latest version of Augur.

More information and updates can be found in a
[GitHub issue](https://github.com/nextstrain/conda-base/issues/105).
