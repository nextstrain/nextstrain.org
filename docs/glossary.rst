========
Glossary
========

.. default-role:: term

.. warning::
  This glossary is for developers of nextstrain.org.  We also have a
  :doc:`general Nextstrain glossary <docs:reference/glossary>` for users.

Terms used in the nextstrain.org codebase, issues, documentation, and beyond.
Arranged not alphabetically but conceptually since the terms are searchable and directly linkable.

.. glossary::

  Source
    An implementation concept encompassing both the place from which `docs:JSONs` are fetched for a `docs:dataset` and their authorization rules.
    Except for our sources for `core`, `staging`, `community`, and ``/fetch``, sources currently have a 1:1 correspondence with `groups <group>`.
    However, a group source and Group itself are `not conceptually synonymous <https://github.com/nextstrain/nextstrain.org/issues/76#issuecomment-574303470>`__.
    Defined by code in :file:`src/sources/`.

  core
    The primary general-interest `datasets <docs:dataset>` maintained by the Nextstrain team, shown first on the Nextstrain homepage.
    `docs:JSONs` are fetched from the ``nextstrain-data`` S3 bucket.

  staging
    Testing area for `core`.
    `docs:JSONs` are fetched from the ``nextstrain-staging`` S3 bucket.

  community
    `Datasets <docs:dataset>` and `builds <docs:build>` maintained by community members on GitHub, with no coordination from the Nextstrain team required.
    `docs:JSONs` are fetched from community-managed GitHub repositories.
    Some community builds are highlighted on the Nextstrain homepage.

  user

    An individual login account associated with one or more `group`.
    Managed in an AWS Cognito User Pool called ``nextstrain.org``.
    Not to be confused with AWS IAM users.

  Group
    also *Nextstrain Group*

    A named set of `users <user>` with access to see and update a set of `datasets <docs:dataset>` and `narratives <docs:narrative>`.
    Each group has a related `source`, which typically authorizes access based on the group.
    Managed in an AWS Cognito User Pool called ``nextstrain.org``.
    Not to be confused with AWS IAM groups.

  route

    A URL path (e.g. ``/zika``), possibly parameterized (e.g. ``/groups/:groupName/*``), at which nextstrain.org provides content.
    Routes map paths to resources (i.e. HTML pages, images, datasets, narratives, etc).

    The process of finding a matching route, if any exists, is called *routing*.

    The Express server performs server-side routing, which means it responds to HTTP requests for a matching path.
    Express route declarations include the stack of `request handlers <request handler>` to use.

    The Next.js app (sometimes referred to as the "static site") performs client-side routing, which means it displays content based on the browser's ``location``.

  request handler
    also *Express handler*, *route handler*, or just *handler*.

    Either an `endpoint` or `middleware`.

  endpoint

    Function that sends the response to a request.
    Specific to an HTTP method and a resource or type of resource.

  middleware

    Function that either responds to a request or does some preparation and then hands processing to the next `request handler` in the stack.
