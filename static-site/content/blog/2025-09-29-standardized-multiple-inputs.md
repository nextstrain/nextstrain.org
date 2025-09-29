---
author: "The Nextstrain team"
date: "2025-09-29"
title: "Standardized Multiple Inputs"
sidebarTitle: "Standardized Multiple Inputs"
---

The Nextstrain team is continuing our push to facilitate running pathogens
workflows with user data and user config as outlined in our [planned directions for 2025][].
We have decided to standardize configuration parameters for defining multiple
inputs for phylogenetic workflows and have updated our pathogen-repo-guide with
the [latest guidance][].

Our phylogenetic workflows will define the default ``inputs`` for Nextstrain,
which usually links to Nextstrain curated data produced from our ingest workflows.
Custom builds are then expected to include their own inputs with ``additional_inputs``
defined in the ``config.yaml``.

```yaml
inputs:
  - name: nextstrain
    metadata: "s3://nextstrain-data/files/workflows/<pathogen>/metadata.tsv.zst"
    sequences: "s3://nextstrain-data/files/workflows/<pathogen>/sequences.fasta.zst"

additional_inputs:
  - name: private
    metadata: "data/private_metadata.tsv"
    sequences: "data/private_sequences.fasta"
```

If you would like to run the phylogenetic workflow _without_ the Nextstrain inputs,
then you can use the ``inputs`` parameter to completely override them.

```yaml
inputs:
  - name: private
    metadata: "data/private_metadata.tsv"
    sequences: "data/private_sequences.fasta"
```

We will be updating our existing pathogen workflows to use the standardized
parameters and you can track our progress in [our public tracking issue][].
Pathogen workflows that currently support multiple inputs with the standard
parameters are [avian influenza][], [West Nile virus][], and [zika][].
The [input configuration for the SARS-CoV-2 workflow][] already supports multiple
inputs with additional features, so we will not be updating it to conform to the
new standard.

If you have questions or comments, please feel free to post to our [discussion forum][]
or create an issue in a pathogen GitHub repository.

[planned directions for 2025]: /blog/2025-03-31-annual-update-march-2025
[latest guidance]: https://github.com/nextstrain/pathogen-repo-guide/blob/@/phylogenetic/rules/merge_inputs.smk
[our public tracking issue]: https://github.com/nextstrain/public/issues/25
[avian influenza]: https://github.com/nextstrain/avian-flu
[West Nile virus]: https://github.com/nextstrain/wnv
[zika]: https://github.com/nextstrain/zika
[input configuration for the SARS-CoV-2 workflow]: https://docs.nextstrain.org/projects/ncov/page/reference/workflow-config-file.html#inputs
[discussion forum]: https://discussion.nextstrain.org
