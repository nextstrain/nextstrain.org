---
author: "The Nextstrain team"
date: "2025-07-17"
title: "Upgrade to Snakemake v9"
sidebarTitle: "Upgrade to Snakemake v9"
---

The [Nextstrain managed runtimes][] have been pinned to Snakemake version 7 since
2023 to ensure that our pathogen workflows are stable and not affected by any
breaking changes. However, we've realized that remote file support for user data
would be better implemented with [Snakemake's storage support][] that was
introduced with Snakemake version 8. Since we need to make changes across many
pathogen workflows for this upgrade, we've decided to upgrade directly to
the most recent stable version, Snakemake version 9.

To update runtimes to the latest version, please follow our instructions on
[how to update an existing runtime][].

If you are using a Nextstrain-maintained pathogen repo, please review the repo's
changelog for any breaking changes and then update your local copy of the pathogen
repository:

```
# Download and apply changes from the Nextstrain team.
# This only works if there is no conflict with your local repository.
git pull --ff-only origin <default-branch>

# OR:

# Alternately, download and apply changes from the Nextstrain team
# and then replay your local changes on top of those incoming changes.
git pull --rebase origin <default-branch>
```

If you are using a custom Snakemake workflow, you may need to make changes to
your own workflow following [Snakemake's migration guides][].

If you want to delay the upgrade while you are making changes, you can temporarily
use older versions of the runtimes. For the Docker, AWS Batch, and Singularity
runtimes, use the image `nextstrain/base:build-20250708T012131Z`. You can specify
the image directly in your `nextstrain build` command:

```
nextstrain build --image nextstrain/base:build-20250708T012131Z .
```

For the Conda runtime, use the package `nextstrain-base ==20250707T221156Z`.
You must set up the runtime _before_ running the `nextstrain build` command:

```
NEXTSTRAIN_CONDA_CHANNEL=nextstrain/label/main \
NEXTSTRAIN_CONDA_BASE_PACKAGE="nextstrain-base ==20250707T221156Z" \
  nextstrain setup --force conda

nextstrain build --conda .
```

If you have questions or comments, please feel free to post to our [discussion forum][]
or create an issue in a pathogen GitHub repository.

[Nextstrain managed runtimes]: https://docs.nextstrain.org/projects/cli/page/runtimes
[Snakemake's storage support]: https://snakemake.readthedocs.io/page/snakefiles/storage.html
[how to update an existing runtime]: https://docs.nextstrain.org/page/guides/manage-installation.html#update-an-existing-installation
[Snakemake's migration guides]: https://snakemake.readthedocs.io/page/getting_started/migration.html
[discussion forum]: https://discussion.nextstrain.org
