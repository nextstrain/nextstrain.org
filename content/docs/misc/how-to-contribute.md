---
author: "james hadfield"
date: "08/03/2018"
---

The content of this website is built using markdown files located in the `content` folder. (This entire website is a [github repository](github.com/nextstrain/nextstrain) - that link has instructions on how to build the website locally, and Pull Requests will make it to the live website.) For instance, this page is generated from [this markdown file](https://github.com/nextstrain/nextstrain/blob/master/content/tutorial/misc/how-to-contribute.md).


The website scans all the files in the `/content` directory and automatically builds URLs and the sidebar content from this.

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
