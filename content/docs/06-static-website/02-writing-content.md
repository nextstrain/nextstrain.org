---
author: "James Hadfield"
date: "30/04/2018"
title: "How to write markdown content for nextstrain.org"
---

The website scans all the files in the `/content` directory and automatically builds URLs and the sidebar content from this.

### File name
This must be in the format `/content/<CATEGORY>/XX-<CHAPTER>/YY-<FILE_NAME>.md` where `XX` and `YY` are integers defining the relative ordering (used in the sidebar, the actual number is never displayed).

### Frontmatter

The first few lines of the markdown contain the "frontmatter" - here it is for this page:

```yaml
---
author: "james hadfield"
date: "08/03/2018"
---
```

  * `author` and `date` are displayed at the top of the post.
  * The file path encodes the category, chapter & title.

### Markdown
The rest of the file is standard markdown.
  * Codeblocks (opened and closed with three backticks) are styled differently (see the frontmatter above).
  * Quotes (lines starting with >) have a yellow background.

#### Images

#### Embedded content (tweets, videos)
