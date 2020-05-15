---
title: "Data Formats Used by Nextstrain"
---
## Augur output

We use JSONs as the interchange file format between Augur (the bioinformatics tooling) and Auspice (the visualization app).
JSONs are human-readable, parsable in most languages, and extendable.
Augur produces these JSONs via the `augur export` command -- see the [Augur docs for more information [external link]](https://nextstrain-augur.readthedocs.io/en/stable/usage/cli/export.html).

## Auspice input

Any compatible JSONs can be used by Auspice, not just those produced by Augur. Regardless of whether your input JSONs for Auspice came from Augur, you can use Augur's validation tool, `augur validate`, to check JSONs against the appropriate schema(s) --  see the [Augur docs for more information [external link]](https://nextstrain-augur.readthedocs.io/en/stable/usage/cli/validate.html).

There are two ways to specify Auspice input, depending on the major version of Auspice:
- Auspice v1 requires two dataset JSONs (metadata + tree) with an optional, tip-frequencies JSON.
- Auspice v2 is backward compatible with v1, but also can take a single "v2" dataset JSON instead of the metadata + tree v1 JSONs.

For the relevant input JSON schema for each version of Auspice, check out the [Auspice docs [external link]](https://nextstrain.github.io/auspice/introduction/how-to-run#input-file-formats).

## Visualising and sharing results

Once you have prepared your JSON(s) in the Auspice format, you can visualise and share these results in a variety of ways. To find one that meets your needs for privacy and collaboration, check out [our guide on sharing your results](/docs/contributing/sharing-data).