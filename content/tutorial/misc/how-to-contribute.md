---
title: "How To Contribute"
author: "james hadfield"
chapter: "misc"
order: 1
date: "08/03/2018"
type: "tutorial"
---

The content of this website is built using markdown files located in the `content` folder. (This entire website is a [github repository](github.com/nextstrain/nextstrain) - that link has instructions on how to build the website locally, and Pull Requests will make it to the live website.) For instance, this page is generated from [this markdown file](https://github.com/nextstrain/nextstrain/blob/master/content/tutorial/misc/how-to-contribute.md).


The website scans all the files in the `/content` directory and automatically builds URLs and the sidebar content from this.

### Frontmatter

The first few lines of the markdown contain the "frontmatter" - here it is for this page:

```yaml
---
title: "How To Contribute"
author: "james hadfield"
chapter: "misc"
order: 1
date: "08/03/2018"
type: "tutorial"
---
```

  * The `title`, `author` and `date` are displayed at the top of the post.
  * The URL is created by the folder structure and the `title` with spaces replaced by hyphens (slightly confusing I know). So while technically the file name is not used, making it similar to the title seems sensible.
  * The `type` determines which section of this site the post belongs. E.g. "api", "tutorial", "blog" etc.
  * The `chapter` specifies the heading (in the left hand sidebar) which this post appears under.
  * The `order` is never displayed, but is used to order the posts within each chapter.
  * _to do: add subchapter_

### Markdown
The rest of the file is standard markdown.
  * Codeblocks (opened and closed with three backticks) are styled differently (see the frontmatter above).
  * Quotes (lines starting with >) have a yellow background.

#### Images

#### Embedded content (tweets, videos)
