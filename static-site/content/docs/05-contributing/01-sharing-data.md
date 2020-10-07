---
title: "How to share your analyses"
---

### Our Philosophy: Facilitating Open-Science & Sharing of Results

From the beginning, Nextstrain has focused on open, real-time, pre-publication sharing of results.
Every situation is different and over time we've tried to develop a range of different approaches to take steps in this direction wherever possible.

Here is a summary of the different ways one can share data through [nextstrain.org](/) or using the tools which are behind nextstrain:

<br/>

| Name                            | Data lives where?           |  Accessed via             |  Access            |
| --------------------------------| --------------------------- | ------------------------- | ------------------ |
| Nextstrain-maintained pathogens | S3 bucket which we manage   | [nextstrain.org]          | Public             |
| [Nextstrain Community]          | Your own github repo        | nextstrain.org/community/ | Public             |
| [Nextstrain Groups]             | S3 bucket which you manage  | nextstrain.org/groups/... | Public or private  |
| [User-defined data fetch]     | Anywhere accessible via a URL | nextstrain.org/fetch/...  | Public             |
| [auspice.us]                    | On your computer            | [auspice.us]              | Private            |
| [Custom auspice servers]        | Wherever you choose         | your own server's URL     | Your choice        |

We are always excited to help you contribute to Nextstrain, no matter what shape this takes.
Please [get in touch with us](mailto:hello@nextstrain.org) with any specific questions and we'll be happy to help.


### Centrally Maintained, Regularly Updated Datasets

There are a number of datasets which are run by the Nextstrain team or close collaborators, for instance [SARS-CoV-2](/ncov/global), [seasonal influenza](/flu), and [West Nile virus](/WNV/NA).
Each individual dataset contains links to the scientists who maintain it.

We're exited to collaborate with more research groups and expand these datasets -- please [get in touch with us](mailto:hello@nextstrain.org) if this is something you'd like to be involved in.


### Community Maintained Datasets

To make supporting this philosophy as easy as possible, we have created a "community builds" functionality, whereby GitHub is used to store the results of your analyses and the results are available for everyone via nextstrain.org.
This is behind the [community builds](/#community) which you can see on the main page.

See [this page](community-builds) for more information, including a step-by-step guide on how you can get your datasets up as a community build.

### Nextstrain Groups

Groups are an initiative to allow research labs, public health entities and others to manage their own datasets and narratives and share them through nextstrain.org.
Groups can either be private or public in order to allow data sharing to the correct audience -- you can see an example of a public group [here](/groups/blab/).
Private groups will only be visible to people who have a login to nextstrain.org and the permissions to see datasets in the group.

Nextstrain Groups are more scalable than community managed datasets, especially if you have many large datasets, and we're excited with the future possibilities that this opens up.

See [this page](nextstrain-groups) for more information.

### auspice.us

If you have an auspice dataset (i.e. the JSON file to be visualised) then [auspice.us] allows you to simply drag and drop the file onto the browser and have a fully-functioning interactive visualisation similar to those you've seen on nextstrain.org.
Since the data never leaves your computer (it's all done client-side) this can be a useful way to visualise sensitive data without needing to run auspice locally or manage your own server.

> Narratives don't yet work with [auspice.us] but we're hoping to allow this functionality in the future!


### Custom Auspice Servers

Auspice can be run on your own server, including customizations to the appearance and functionality.
This may be appropriate when you want or need full control over how the website is deployed and where the data is stored.
Please see the [auspice docs](https://nextstrain.github.io/auspice/server/introduction) for more information on how to set this up.


[Nextstrain Community]: ./community-builds
[Nextstrain Groups]: ./nextstrain-groups
[User-defined data fetch]: ./fetch-data-from-custom-urls
[Custom auspice servers]: https://nextstrain.github.io/auspice/server/introduction
[auspice.us]: http://auspice.us
[nextstrain.org]: http://nextstrain.org
