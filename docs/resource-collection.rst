===================
Resource Collection
===================

In order for nextstrain.org to handle URLs with `@YYYY-MM-DD` identifiers the
server needs to be aware of which files exist, including past versions.
In the future this data will also be used to list and display all available
resources (and their versions) to the user.

The index location is set by the env/config variable ``RESOURCE_INDEX``. The
``RESOURCE_INDEX`` must be either a "s3://" address or a local file path. If the
file is located on S3 it must be gzipped. The server loads this index at start
time and refreshes it hourly. The nextstrain.org testing & production configs
currently set this to ``s3://nextstrain-inventories/resources.json.gz``.

Resource collections can be ignored by the server by setting the env variable
``RESOURCE_INDEX="false"`` or by omitting it from your configuration JSON.


Local index generation
======================

The resource index may be regenerated locally, see ``node
./resourceIndexer/main.js --help`` for details. By default, this will access S3
manifest files in order to create the index (see necessary AWS permissions
below), however you can point the indexer to local files if desired. To use
local files, download a suitable manifest and inventory from
``s3://nextstrain-inventories`` and name them like so:

* For ``nextstrain-data``: ``./devData/core.manifest.json`` and ``core.inventory.csv.gz``
* For ``nexstrain-staging``: ``./devData/staging.manifest.json`` and ``staging.inventory.csv.gz``

then run the indexer with the ``--local`` flag.

To use a locally produced index, set the env variable ``RESOURCE_INDEX`` to
point to the (JSON) file when you run the server.


Automated index generation
==========================

The resource collection index is rebuilt every night via a GitHub action running
from this repo.

*This approach should be revisited when (if) we start indexing private data,
especially for the potential of the GitHub action logging sensitive information
which will be publicly visible.*

AWS settings necessary for resource collection
==============================================

The index creation, storage and retrieval requires certain AWS settings which
are documented here as most of them are not under terraform control. We use `S3
inventories
<https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-inventory.html>`__
to list all the documents in certain buckets (or bucket prefixes) which are
generated daily by AWS. The index creation script will download these
inventories and use them to create an index JSON which it uploads to S3. The
nextstrain.org server will access this JSON from S3.

S3 inventories
--------------

We currently produce inventories for the core (s3://nextstrain-data) and
staging (s3://nextstrain-staging) buckets which are generated daily and
published to s3://nextstrain-inventories. The
s3://nextstrain-inventories bucket is a private bucket with versioning enabled. The inventory
configuration can be found in the AWS console for
`core <https://s3.console.aws.amazon.com/s3/management/nextstrain-data/inventory/view?region=us-east-1&id=config-v1>`__
and
`staging <https://s3.console.aws.amazon.com/s3/management/nextstrain-staging/inventory/view?region=us-east-1&id=config-v1>`__.
The config specifies that additional metadata fields for last modified
and ETag are to be included in the inventory. The inventories for core &
staging are published to
s3://nextstrain-inventories/nextstrain-data/config-v1 and
s3://nextstrain-inventories/nextstrain-staging/config-v1, respectively.
The cost of these is minimal (less than $1/bucket/year).

A lifecycle rule on the s3://nextstrain-inventories bucket (`console link
<https://s3.console.aws.amazon.com/s3/management/nextstrain-inventories/lifecycle/view?region=us-east-1&id=delete+stale+inventories>`__)
marks inventory-related files as deleted 30 days after they are created, and
permanently deletes them 7 days later.

Index creation (Inventory access and index upload)
--------------------------------------------------

**Automated index generation**

The GitHub action assumes necessary AWS permissions via the IAM role
`GitHubActionsRoleResourceIndexer
<https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/roles/details/GitHubActionsRoleResourceIndexer>`__
which is obtained using OIDC. This role uses permissions from the IAM policy
`NextstrainResourceIndexer
<https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/policies/details/arn%3Aaws%3Aiam%3A%3A827581582529%3Apolicy%2FNextstrainResourceIndexer>`__
to list & read the S3 inventories, as well as upload the new index.

**Local index generation for development purposes**

For local index generation (e.g. during development) you will need IAM
credentials which can list and get objects from s3://nextstrain-inventories; if
you want finer scale access for local index creation, you can restrict access to
certain prefixes in that bucket - for instance ``nextstrain-data/config-v1`` and
``nextstrain-staging/config-v1`` correspond to core and staging buckets,
respectively.

To upload the index you will need write access for
s3://nextstrain-inventories/resources.json.gz. Note that if your aims are
limited to local development purposes this is not necessary (see `Local development`_).


Index backups
-------------

The ``nextstrain-inventories`` bucket is version enabled so past versions of
``s3://nextstrain-inventories/resources.json.gz`` are available.

A lifecycle rule on the s3://nextstrain-inventories bucket (`console link
<https://s3.console.aws.amazon.com/s3/management/nextstrain-inventories/lifecycle/view?region=us-east-1&id=delete+old+versions+of+the+index>`__)
permanently deletes past versions of this file 30 days after it became
noncurrent (i.e. it was replaced with a new upload of the index.)


Index access by the server
--------------------------

IAM users ``nextstrain.org`` and ``nextstrain.org-testing``, which are under
terraform control, have read access to
s3://nextstrain-inventories/resources.json.gz via their associated policies.