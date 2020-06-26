---
title: "Scalable Sharing with Nextstrain Groups"
---

We want to enable research labs, public health entities and others to share their datasets and narratives through Nextstrain with complete control of their data and audience. Nextstrain Groups is more scalable than [community builds](community-builds) in both data storage and viewing permissions.
Each group manages its own AWS S3 Bucket to store datasets and narratives, allowing many large datasets. Data of a public group are accessible to the general public via nextstrain.org, while private group data are only visible to logged in users with permissions to see the data. A single entity can manage both a public and a private group in order to share data with different audiences.

> Nextstrain Groups is still in the early stages and require a Nextstrain team member to set up and add users.
Please [get in touch with us](mailto:hello@nextstrain.org) and we'd be happy to set up a group for you.

### How Does This Actually Work?
* Run your analysis locally ([see the bioinformatics introduction](/docs/bioinformatics/introduction-to-augur))
* Upload the datasets or narratives you've produced to the group's AWS S3 Bucket
    * There are no naming restrictions of the dataset JSONs (see [expected formats](/docs/bioinformatics/data-formats))
    * Narrative Markdown files cannot be named `group-overview.md` but otherwise there are no naming restrictions
* Access your data via the group's splash page at "nextstrain.org/groups/" + "group name". Example: [nextstrain.org/groups/blab](/groups/blab).

### How to Customize the Group's Splash Page
You can customize the content of the group's splash page by uploading two files to the group's S3 Bucket:
* `group-logo.png`: logo to be displayed at the top of the page
* `group-overview.md`: content customization of the page

##### YAML Frontmatter
This defines the title, byline, website, and show options of the splash page.
It must appear at the top of the `group-overview.md` file and looks like:

```yaml
---
title: "Splash Page Title"
byline: "Byline that is displayed directly below the title of the page"
website: https://example.com
showDatasets: true
showNarratives: true
---
```
* The only required field is `title`.
* If no `byline` field is provided, then no byline will be displayed.
* If no `website` field is provided, then no website will be displayed.
* The `showDatasets` and `showNarratives` fields must be `true` or `false`, where `true` means to show the list of available datasets or narratives on the page.

##### Markdown Content
The content of the `group-overview.md` file can be anything you want in Markdown syntax.
This content will be displayed between the byline and the list of available datasets on the splash page.
Use it to give a brief overview or introduction of your group!
