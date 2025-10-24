===========
RESTful API
===========

This document describes the RESTful_ web API provided by nextstrain.org.

The API's design tries to:

1. Focus conceptually on the level of datasets and narratives rather than
   files.

2. Use existing, familiar URLs for resources rather than invent a new parallel
   URL structure, and achieve this primarily by overlaying programmatic
   endpoints using `content negotiation`_.

3. Establish a stable foundation for future additions and changes while still
   making it possible to maintain backwards compatibility for existing clients.

The initial functionality is focused on dataset and narrative management
endpoints to support the :ref:`cli:nextstrain remote` family of commands
(see motivation_).  In the future, we intend to expand the functionality and
make this API a foundation for serving other software clients and user
audiences.

.. _RESTful: https://restfulapi.net
.. _content negotiation: https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation

.. highlight:: none

Synopsis
========

.. code-block:: bash

    # Download a main dataset JSON file…
    curl https://nextstrain.org/ncov/open/global/all-time                       \
        --header 'Accept: application/vnd.nextstrain.dataset.main+json'         \
        --compressed                                                            \
            > ncov_open_global_all-time.json

    # …and re-upload it another location.
    curl https://nextstrain.org/groups/blab/ncov/latest                         \
        --header 'Authorization: Bearer eyJraWQiOiJyM3…'                        \
        --header 'Content-Type: application/vnd.nextstrain.dataset.main+json'   \
        --upload-file ncov_open_global_all-time.json


    # Download a narrative Markdown file…
    curl https://nextstrain.org/narratives/ncov/sit-rep/2020-01-25              \
        --header 'Accept: text/vnd.nextstrain.narrative+markdown'               \
        --compressed                                                            \
            > ncov_sit-rep_2021-01-25.md

    # …and re-upload it to another location.
    curl https://nextstrain.org/groups/blab/narratives/ncov-first-sit-rep       \
        --header 'Authorization: Bearer eyJraWQiOiJyM3…'                        \
        --header 'Content-Type: text/vnd.nextstrain.narrative+markdown'         \
        --upload-file ncov_sit-rep_2021-01-25.md

    # Download a group overview…
    curl https://nextstrain.org/groups/blab/settings/overview                   \
        --header 'Authorization: Bearer eyJraWQiOiJyM3…'                        \
        --header 'Accept: text/markdown'                                        \
        --compressed                                                            \
            > overview.md

    # …and re-upload it after making changes.
    curl https://nextstrain.org/groups/blab/settings/overview                   \
        --header 'Authorization: Bearer eyJraWQiOiJyM3…'                        \
        --header 'Content-Type: text/markdown'                                  \
        --upload-file overview.md

    # List versions of a pathogen repository (set of pathogen workflows)
    curl https://nextstrain.org/pathogen-repos/measles/versions                 \
        --header 'Accept: application/json'

    # Download a ZIP archive of a pathogen repository at a specific version.
    curl https://nextstrain.org/pathogen-repos/measles/versions/main            \
        --header 'Accept: application/zip, */*'                                 \
        --location                                                              \
            > measles.zip

Authentication
==============

Authentication is required for:

1. All resource-modifying requests (PUT, DELETE).
2. Read-only requests (GET, HEAD, OPTIONS) to private resources (e.g. private
   `Nextstrain Groups`_).
3. All requests to group settings endpoints.

Authentication is not required to download public datasets or narratives.
Requests which are not allowed will receive a `401 Unauthorized`_ response if
the request wasn't authenticated and a `403 Forbidden`_ response if it was.

Requests are authenticated by one of two methods:

1. An Authorization_ header bearing an identity (id) token, such as those
   managed by the :ref:`cli:nextstrain login` command.  For example::

       Authorization: Bearer eyJraWQiOiJyM3…

2. A cookie associated with a logged-in web session, such as those set by
   nextstrain.org.  Cookies are usually automatically and transparently sent
   by the browser.

All clients except nextstrain.org itself should use an Authorization_ header.

Third-party clients may also be registered with us and then use our OAuth2
provider at <https://login.nextstrain.org> in order to obtain tokens for a
user.

.. _Nextstrain Groups: https://nextstrain.org/groups
.. _401 Unauthorized: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
.. _403 Forbidden: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403
.. _Authorization: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization


Resource types
==============

Datasets
    Trees and other sequenced-based data for visualization with Auspice.
    Conceptually singular but comprised of multiple "physical" parts/files.

Narratives
    Slide-like documents for presenting commentary alongside views of datasets
    in Auspice.

Group settings and memberships
    :doc:`Nextstrain Groups <docs:learn/groups/index>` administration

Pathogen repositories
    Container of pathogen-specific workflows (typically using Snakemake) to
    ingest data from upstream sources and produce datasets for Auspice (and
    sometimes Nextclade).  Typically used with Nextstrain CLI.


Media types
===========

Several Nextstrain-specific `media types`_ are used to identify the different
data files (or "representations") that make up a conceptual Nextstrain dataset
or narrative.  General-purpose media types, e.g. for JSON, images, and
Markdown, are also used where applicable.

When making a GET or HEAD request, use these types in the ``Accept`` request
header to indicate the desired representation.  Responses will use the
``Content-Type`` response header to identity the representation they contain.

When making a PUT request, use these types in the ``Content-Type`` request
header to identify the representation being sent.

.. _media types: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types


Datasets
--------

See also our :doc:`data formats <docs:reference/data-formats>` documentation
for more information on how these different JSON files are used and their
content.

``application/vnd.nextstrain.dataset.main+json``
    Main JSON content for the dataset.  Currently only v2 datasets are
    supported, and content is expected (but not yet validated) to conform to
    the <https://nextstrain.org/schemas/dataset/v2> `JSON Schema`_.

``application/vnd.nextstrain.dataset.root-sequence+json``
    Root sequence sidecar JSON content.

``application/vnd.nextstrain.dataset.tip-frequencies+json``
    Tip frequencies sidecar JSON content.

``application/vnd.nextstrain.dataset.measurements+json``
    Measurements sidecar JSON content.

``application/json``
    Currently an alias for ``application/vnd.nextstrain.dataset.main+json``.
    Intended primarily for curious humans instead of programs and so may change
    over time.  Not recommended for stable programmatic use.

.. _JSON Schema: https://json-schema.org


Narratives
----------

See also our :doc:`narrative format <docs:tutorials/narratives-how-to-write>`
documentation for more information on the Markdown content.

``text/vnd.nextstrain.narrative+markdown``
    The primary Markdown content for the narrative.

``text/markdown``
    Currently an alias for ``text/vnd.nextstrain.narrative+markdown``.
    Intended primarily for curious humans instead of programs and so may change
    over time.  Not recommended for stable programmatic use.


Group settings
--------------

See also our :doc:`group customization <docs:guides/share/groups/customize>`
documentation for more information.

``text/markdown``
``text/plain``
    Group overview Markdown, including frontmatter fields.

``image/png``
    Group logo.


Group memberships
-----------------

``application/json``
    Lists of group members, group roles, and group role members.


Pathogen repository versions
----------------------------

``application/json``
    Metadata about a resolved pathogen repository version, namely the
    ``revision`` for now.

``application/zip``
    ZIP archive of the resolved pathogen repository version's contents.
    Typically fulfilled via a redirect.  You should also accept ``*/*`` as a
    fallback to account for third-party API behaviour.


Link header
-----------

Responses include a Link_ header enumerating the media types supported for the
requested resource::

    Link: </zika>; rel="alternate"; type="text/html",
          </zika>; rel="alternate"; type="application/json",
          </zika>; rel="alternate"; type="application/vnd.nextstrain.dataset.main+json",
          </zika>; rel="alternate"; type="application/vnd.nextstrain.dataset.root-sequence+json",
          </zika>; rel="alternate"; type="application/vnd.nextstrain.dataset.tip-frequencies+json"

This information may be automatically used by an API client to, for example,
make requests for all supported representations (or some subset, e.g. all
``application/vnd.nextstrain.dataset.*``) without hardcoding them.

.. _Link: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link


Versioning
==========

Neither endpoints nor media types are currently versioned.

It's expected that either versioned or schema-parameterized media types will be
added in the future when there's a need to distinguish between incompatible
schema versions of the same conceptual representation (e.g. when we have a v3
main dataset schema).  The current media types are considered unversioned and
will continue to work in a future where corresponding versioned media types
also exist, with the expectation that the unversioned media types will always
be an alias for their latest versions.

Revisions for some datasets and narratives resources are implicitly versioned
via date-based snapshots.  Versions are specified in the URL path.  See our
:doc:`previous analyses <docs:guides/snapshots>` documentation for more
information.  Revisions for datasets and narratives may also be supported via
other mechanisms in the future.

Revisions of pathogen repository resources are explicitly versioned.  Versions
are specified in the URL path.  The versioning model supports both named
versions (e.g. ``1.2.3``, ``v42``, ``main``) which might resolve differently at
different times (i.e. are mutable) and revision ids (e.g.
``abadcafefeedfacebadc0ffee0ddf00ddeadd00d``) which won't (i.e. are immutable
content-addressed versions).  Currently these closely reflect our use of Git
for storage and distribution—Git refs (tags, branches) are named versions and
commit ids (SHAs) are revisions—but we may manage versions with the same
properties outside of Git in the future.


Methods
=======

GET
    Retrieves the resource representation identified by the request URL and
    ``Accept`` media type.

HEAD
    Status and headers that would be returned by an equivalent GET request.
    Useful for checking existence, for example, without actually downloading
    content.

PUT
    Creates or replaces the resource representation identified by the request
    URL and ``Content-Type`` media type.  Responds with status 204 if
    successful.

POST
    Currently unused.  Future use may include multi-file upload endpoints or
    other cases where PUT is not appropriate.

DELETE
    Removes all representations of the resource identified by the request URL.
    Responds with status 204 if successful.

OPTIONS
    Lists the methods, via the ``Allow`` header, that the authenticated user
    (if any) is authorized to use on the resource identified by the request
    URL.  Responds with status 204 is successful.


Conditional requests
====================

Endpoints return ``ETag`` and ``Last-Modified`` response headers if available
(typically for GET only).  When those headers are present, `conditional
requests`_ using ``If-None-Match`` and ``If-Modified-Since`` are supported.

.. _conditional requests: https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests


Endpoints
=========

The following dataset endpoints exist::

    {GET, HEAD, PUT, DELETE, OPTIONS} /avian-flu/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /dengue/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /ebola/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /enterovirus/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /lassa/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /measles/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /mers/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /mumps/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /ncov/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /nipah/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /norovirus/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /rubella/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /seasonal-flu/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /tb/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /WNV/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /yellow-fever/*
    {GET, HEAD, PUT, DELETE, OPTIONS} /zika/*

    {GET, HEAD, PUT, DELETE, OPTIONS} /staging/*

    {GET, HEAD, PUT, DELETE, OPTIONS} /groups/{name}/*

    {GET, HEAD, OPTIONS} /community/{user}/{repo}/*

    {GET, HEAD, OPTIONS} /fetch/*

The following narrative endpoints exist::

    {GET, HEAD, PUT, DELETE, OPTIONS} /narratives/*

    {GET, HEAD, PUT, DELETE, OPTIONS} /staging/narratives/*

    {GET, HEAD, PUT, DELETE, OPTIONS} /groups/{name}/narratives/*

    {GET, HEAD, OPTIONS} /community/narratives/{user}/{repo}/*

    {GET, HEAD, OPTIONS} /fetch/narratives/*

The following group settings endpoints exist::

    {GET, HEAD, PUT, DELETE, OPTIONS} /groups/{name}/settings/logo

    {GET, HEAD, PUT, DELETE, OPTIONS} /groups/{name}/settings/overview

.. _api-groups-membership:

The following group membership endpoints exist::

    {GET, HEAD, OPTIONS} /groups/{name}/settings/members

    {GET, HEAD, OPTIONS} /groups/{name}/settings/roles

    {GET, HEAD, OPTIONS} /groups/{name}/settings/roles/{role}/members

    {GET, HEAD, PUT, DELETE, OPTIONS} /groups/{name}/settings/roles/{role}/members/{username}

.. _api-pathogen-repos:

The following pathogen repository endpoints exist::

    {GET, HEAD} /pathogen-repos/{name}/versions
    {GET, HEAD} /pathogen-repos/{name}/versions/{version}

.. _motivation:

Motivation
==========

Development was motivated by the goal for :doc:`Nextstrain CLI <cli:index>` to
make requests to nextstrain.org using normal user login credentials instead
instead of making requests directly to S3 using separate, per-user AWS IAM
credentials.  An alternative solution of using temporary AWS credentials
provisioned by an AWS Cognito Identity Pool seemed like a clear choice given
we're using Cognito User Pools for authentication, but it wasn't feasible to
appropriately scope the credentials for each group of users due to limitations
of resource tags and IAM policy tag matching.

Proxying through nextstrain.org also gives us a lot more power to make the API
easier for clients to work with (e.g. auto-compressing for them, setting
resource metadata, validating schemas to prevent bad uploads, etc) and makes
backend changes easier to coordinate since clients won't be directly accessing
the storage backend.
