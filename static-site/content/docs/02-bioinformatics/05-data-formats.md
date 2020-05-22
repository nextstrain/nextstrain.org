---
title: "Data Formats Used by Nextstrain"
---
## Augur output

We use JSONs as the interchange file format between Augur (the bioinformatics tooling) and Auspice (the visualization app).
JSONs are human-readable, parsable in most languages, and extendable.
Augur produces these JSONs via the `augur export` command -- see the [Augur docs for more information [external link]](https://nextstrain-augur.readthedocs.io/en/stable/usage/cli/export.html).

## Auspice input

Any compatible JSONs can be used by Auspice, not just those produced by Augur. Regardless of whether your input JSONs for Auspice came from Augur, you can use Augur's validation tool, `augur validate`, to check JSONs against the appropriate schema(s) --  see the [Augur docs for more information [external link]](https://nextstrain-augur.readthedocs.io/en/stable/usage/cli/validate.html).

Auspice requires input in a single "v2" dataset JSON, which includes:
- The phylogenetic tree in a nested format
- Metadata about pathogen sequences on the tree

and optionally, tip frequencies data specified in a _separate_ JSON file.

For the Auspice input JSON schema, check out the [Auspice docs [external link]](https://nextstrain.github.io/auspice/introduction/how-to-run#input-file-formats).

> If you happen to maintain builds that rely on Auspice v1, don't worry - Auspice v2 is backward compatible and accepts the v1 format as well. The v1 schema is also available at the link above.

## Visualising and sharing results

Once you have prepared your JSON(s) in the Auspice format, you can visualise and share these results in a variety of ways. To find one that meets your needs for privacy and collaboration, check out [our guide on sharing your results](/docs/contributing/sharing-data).