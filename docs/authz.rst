=============
Authorization
=============

nextstrain.org implements a role-based access control (RBAC) system for
authorizing who can view and manage resources likes datasets and narratives.
The same system is used for browser-based visitors and API clients.  In this
system:

- Users are members of roles_.
- Objects (e.g. datasets or narratives) have tags_.
- Policies_ contain rules which define an allowed set of actions_ for a given
  (role, tag) pair.
- Enforcement_ is performed by calling ``authz.assertAuthorized(user, action, object)``.

Currently roles, tags, and policies are entirely system-defined and hardcoded.
In the future, all three could be, in part, defined by users and
stored/retrieved as needed.

The design of this system is influenced by "`RBAC like it was meant to be`_".

.. _policies:

Policies
========

There is no single policy for all of nextstrain.org but different policies for
different parts of the site.  Currently, policies are defined for and attached
to each :term:`Source` and :term:`Group`.

The design of the system allows for policies to be easily stacked or combined
(e.g. concatenate all the rules), so if necessary we could introduce a global
policy or other policy layers in the future.

Policies are arrays of objects, e.g.::

    [
      { tag: authz.tags.Visibility.Public,
        role: "*",
        allow: [authz.actions.Read],
      },
    ]

All three keys are required:

:tag: ``authz.tags`` symbol, or ``"*"`` to impose no restriction on object tag.
:role: Name of role as a string, or ``"*"`` to impose no restriction on user role.
:allow: List of ``authz.actions`` symbols.

The example above allows any user (anonymous or logged in) to see objects
marked public.

Roles and tags both ensure that policy rules are always many-to-many from the
start, even if a role only contains a single user (e.g. a single Group owner)
or a tag is only used for a single object.  This property generally makes
management simpler and more consistent.


.. _roles:

User roles
==========

A user's roles are the names of the AWS Cognito groups of which they are a
member.  Anonymous users have no roles.

Roles for a :term:`Nextstrain group <group>` are based on the name of the group
and name of the generic role within the group (viewers, editors, owners), e.g.
``blab/editors``.


.. _tags:

Object tags
===========

Tags are defined in the ``authz.tags`` object.  Objects which are passed to
``authz.assertAuthorized()`` must have an ``authzTags`` property that is a Set_
of tags.  Objects may choose to explicitly inherit tags propagated from their
container (e.g. a ``Resource`` object inheriting tags from its ``Source``
object).

.. _Set: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

By using tags on objects, access policies like:

    The SciComm team should be able to read and write narratives *but not
    datasets*.

and:

    The SARS-CoV-2 researchers should be able to read and write *"ncov"*
    datasets and narratives in our Group *but not other datasets and
    narratives*.

are expressible without requiring any changes to the policy syntax or authz
system design.  (The first is implementable with the current tags; the second
would require a new system- or user-defined tag.)

If we implement user-defined tags, a good design to follow is the tag owner
system described in "`RBAC like it was meant to be
<https://tailscale.com/blog/rbac-like-it-was-meant-to-be/>`_".


.. _actions:

Actions
=======

Actions are defined in the ``authz.actions`` object.  There are two available
actions: ``Read`` and ``Write``.   In comparison to the common CRUD model,
``Write`` encompasses create, update, and delete.

These two actions provide the only distinctions we need right now.  If we need
finer control in the future, we can split up ``Write`` and/or add new actions.


.. _enforcement:

Enforcement
===========

The main enforcement function used to guard access-controlled code is::

    authz.assertAuthorized(user, action, object)
    
It throws an ``AuthzDenied`` exception if the *user* is **not** allowed to
perform the *action* on the *object* as determined by the policy covering the
object (e.g. from the object's ``Source``).  Otherwise, it returns nothing.

It is the responsibility of the enforcement function to determine the policy in
force for the given object.
