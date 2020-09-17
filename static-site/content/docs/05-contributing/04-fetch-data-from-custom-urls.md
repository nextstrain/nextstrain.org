---
title: "Fetch datasets & narratives accessible via a public URL"
---

We want to allow researchers the maximum amount of control over where their data lives and who controls it.
To facilitate this, we promote a couple of easy-to-use methods to facilitating this - [Nextstrain Groups](./nextstrain-groups), where the data are stored on Amazon AWS S3 and [Nextstrain Community](./community-builds) where the data lives within your own GitHub repos. 
This page describes a third way:

**Datasets or narratives which are accessible via a public URL can be accessed through a `nextstrain.org/fetch/...` URL**

* Given an Auspice v2 dataset JSON available at `https://A.B.C.json`, the dataset may be accessed via `https://nextstrain.org/fetch/A.B.C.json`.
* Given a narrative markdown file publicly available at `https://A.B.C.md`, the dataset may be accessed via `https://nextstrain.org/fetch/narratives/A.B.C.md`.


### Examples

1. **Single dataset** The nextstrain zika dataset is accessible at https://data.nextstrain.org/zika.json (click that link to see the actual JSON data)
and can therefore be viewed within nextstrain.org at https://nextstrain.org/fetch/data.nextstrain.org/zika.json.

2. **Narratives** There is an introductory narrative stored in our GitHub repo and therefore accessible via the URL https://raw.githubusercontent.com/nextstrain/narratives/master/intro-to-narratives.md (click there to read the actual markdown file).
You can see this rendered in Nextstrain at: https://nextstrain.org/fetch/narratives/raw.githubusercontent.com/nextstrain/narratives/master/intro-to-narratives.md.

3. **Dual trees** Displaying two trees side-by-side is possible using the same syntax as with other dataset sources, e.g. https://nextstrain.org/fetch/data.nextstrain.org/flu_seasonal_yam_na_2y.json:fetch/data.nextstrain.org/flu_seasonal_yam_ha_2y.json



### Notes

**HTTPS only** The [HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/https) protocol is mandated, but "https://" must be left out of the datset URL when it's written as part of the nextstrain URL.
Formally, only the [hier-part](https://tools.ietf.org/html/rfc3986#section-3) of the URL is used -- we mandate the scheme to be HTTPS and ignore any queries (or fragments).

**Suffixes not required** The above examples have assumed that the URL for the dataset JSON ends with `.json`, as is often the case, but this isn't required! For instance, you could have a server which generates a JSON at `https://my-server/makeMeADataset` and access this via `https://nextstrain.org/fetch/my-server/makeMeADataset`.

**Sidecar files** (such as tip-frequency JSONs) are fetched similarly to other sources -- e.g. if the dataset is at `https://A/B.json` then a subsequent request to `https://A/B_tip-frequencies.json` will be made. 
If the fetch URL doesn't end in `.json` then the GET request would be to `https://A/B_tip-frequencies`.

**Authentication** is not currently supported. Please see [Nextstrain Groups](./nextstrain-groups) for this!



### How do I manage the data storage?

That's completely up to you - all that we require for this to work is that it's publicly accessible via a URL over HTTPS. 
It could be a static asset (e.g. AWS S3) or a server which responds dynamically.
We recommend the the data is transmitted using compression to improve loading times for the client.

P.S. If you build something interesting here, for instance a server which generates the JSON on-the-fly, we'd love to [hear from you!](mailto:hello@nextstrain.org).

