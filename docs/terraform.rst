.. highlight:: shell-session

=========
Terraform
=========

This document describes nextstrain.org's use of `Terraform
<https://www.terraform.io/>`__ to manage relevant infrastructure, such as our
AWS resources like Cognito user pools.

.. note::
    You'll need ambiently-configured AWS credentials with broad admin-level
    access to read (and optionally modify) resources in our account.

    Please step cautiously and be careful when using them!


Configurations
==============

All ``terraform`` commands below expect to be run from within a directory
containing a Terraform configuration (i.e. a set of one or more ``*.tf`` or
``*.tf.json`` files).

We have the following configurations:

  - :file:`env/production`

To choose which configuration you're working with, you can either:

  1. ``cd`` into the configuration directory before running any ``terraform``
     command, or

  2. run all ``terraform`` commands with the ``-chdir=<dir>`` option, e.g.
     ``terraform -chdir=env/production plan``.


Setup
=====

`Install Terraform <https://www.terraform.io/downloads>`__ and then, from a
configuration directory (e.g. :file:`env/production`), run::

    $ terraform init

This will create a :file:`.terraform` directory to hold installed modules,
local settings, and other data needed by the ``terraform`` command.


Authoring changes
=================

Our Terraform configuration consists of a file structure like:

.. code-block:: none

    env/
        production/
            terraform.tf
    aws/
        main.tf
        cognito/
            main.tf
            clients.tf
            …
        iam/
            main.tf
            …

:file:`env/production/terraform.tf` is the single file that makes up the root
module of the production configuration.  This file imports local modules we
define in :file:`aws/cognito/` and :file:`aws/iam/`.

Modules are any directory containing one or more Terraform configuration files
(``.tf`` or ``.tf.json``), along with other optional files.  Filenames (e.g.
:file:`main.tf`) are by convention only and all Terraform files will
essentially be concatenated together and evaluated as one large blob.

Any edits to the Terraform configuration will be picked up automatically when
you next run ``terraform``.

.. hint::
    Sometimes "`clicking around in the web console, then lying
    about it <https://www.lastweekinaws.com/blog/clickops/>`__" is the easiest
    way to create or modify complex resources.  There is no shame in doing
    that!  It's an example of :ref:`importing-resources`.


Previewing changes
==================

Compare the remote state with the current configuration described in your local
repository by running::

    $ terraform plan

This describes any changes deemed necessary.  It is always safe to run, and
it's often useful to run this frequently when developing to cross-check your
expectations.


Deploying changes
=================

.. note::
    We currently do not automatically deploy changes.  Please manually
    coordinate application deploys—that is, deploys to `next.nextstrain.org
    <https://next.nextstrain.org>`__ via merges to ``master`` and subsequent
    promotion to `nextstrain.org <https://nextstrain.org>`__—with Terraform
    changes.

First make a plan and save it to a file::

    $ terraform plan -out=plan

Review the console output to make sure the plan is ok.  You can reproduce the
console output at a later point by running ``terraform show plan``.

.. warning::
    Make sure critical resources won't be destroyed (deleted, removed, etc)!
    Due to our tightly coupled application and infrastructure design,
    operations should typically be limited to creations and updates-in-place.

If all looks good, apply the plan from the file when ready::

    $ terraform apply plan


Linting
=======

A GitHub Actions workflow, :file:`.github/workflows/terraform-lint.yml`,
automatically checks formatting of all Terraform files in the respository and
validates the overall configuration.

During development, you should also format::

    $ ./scripts/terraform-fmt

and validate::

    $ terraform validate

your changes locally, either manually or by configuring these to run
automatically in any manner of your choosing.


.. _importing-resources:

Importing resources
===================

Importing is the process of bringing resources that already exist (e.g. in AWS)
under the management of Terraform.  The process involves reconciling new
configuration describing the resources with their existing state so that
Terraform thinks no changes need to be made.  It goes somewhat like this:

 1. Switch to a temporary workspace so that state changes made by ``terraform
    import`` during your development aren't made to the shared production
    state::

        $ terraform state pull | (terraform workspace new NAME && terraform state push -)

    Replace ``NAME`` with an appropriate name for the workspace (think like
    branch names).

    .. note::
        `A bug <https://github.com/hashicorp/terraform/issues/29819>`__ in
        ``terraform workspace new`` makes its ``-state=PATH`` parameter
        unusable for our S3 backend.

 2. Define a stub resource in the configuration, e.g.

    .. code-block:: terraform

        resource "aws_s3_bucket" "example" {
            # stub
        }

 3. Update Terraform's state to match the existing state, e.g.::

        $ terraform import aws_s3_bucket.example example-bucket-name

    Paths to resources inside of modules use syntax like:

    .. code-block:: none

        module.iam.aws_iam_policy.NextstrainDotOrgServerInstance

 4. Iteratively fill out the stub resource in the configuration with the help
    of inspecting the state::

        $ terraform state show aws_s3_bucket.example

    and inspecting the change plan::

        $ terraform plan

    The goal is to make the configuration match the existing state such that no
    changes are planned.

    It's often possible to directly massage the output of ``terraform state
    show`` into appropriate configuration, particularly with the help of
    ``terraform validate`` to spot state outputs which aren't valid resource
    arguments.

    .. note::
        Be sure to replace ids and other resource linkages with `value
        references <https://www.terraform.io/language/expressions/references>`__
        if the resource being referred to is already managed by Terraform.

 5. Once ``terraform plan`` is a no-op, go back and restructure the
    configuration, add comments, remove defaults which are unnecessary, etc.
    until it reads cleanly and makes sense to a new reader.

    Before committing, ensure that ``terraform plan`` is still a no-op.

 6. Clean up your temporary workspace::

        $ terraform workspace select default
        $ terraform workspace delete -force NAME

    Using ``-force`` is necessary because the workspace state still contains
    resources we want to keep around and not destroy (since they're still
    referenced by the production state).

Since the ``default`` workspace state still doesn't contain the imported
resource, ``terraform plan`` will now report changes are needed because of the
new configuration.  This is as it should be since the ``default`` workspace
state should correspond to what's on the tip of the default Git branch to avoid
affecting other configuration changes in the meantime.

After merging the branch with the configuration change, re-import the existing
resource's state into the ``default`` workspace, e.g.::

    $ terraform import aws_s3_bucket.example example-bucket-name

Now ``terraform plan`` should report nothing to be done.


Security
========

Terraform state may contain secrets embedded in it and is best treated as
secret material itself.  Avoid keeping copies of it on your local computer when
possible.


See also
========

- `Terraform CLI documentation <https://www.terraform.io/cli/>`__
- `Terraform configuration language documentation <https://www.terraform.io/language>`__
- `AWS Provider documentation <https://registry.terraform.io/providers/hashicorp/aws/latest/docs>`__
