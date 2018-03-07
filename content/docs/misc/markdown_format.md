---
title: "narrative markdown description"
chapter: "misc"
order: 1
date: "01/01/2017"
type: "docs"
---

Markdown files in `/content` are automatically consumed and displayed according to the frontmatter, which is found at the start of the markdown file.
For example, here is the frontmatter for this post:
```
---
title: "narrative markdown description"
chapter: "misc"
order: 1
date: "01/01/2017"
type: "docs"
---
```

The folder structure (e.g. `/content/docs/misc`) is used to generate the URL, together with the `title` defined in the frontmatter (so the file name doesn't actually matter).
The `type` should be one of `docs`, `tutorial`, `blog` (more to come).
The `chapter` specifies the heading (in the left hand sidebar) which this post appears under.
The `order` specifies the relative ordering of posts within each heading.
