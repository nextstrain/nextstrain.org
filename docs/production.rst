.. default-role:: literal
.. highlight:: none

=======================
Production requirements
=======================

Requirements and considerations for deploying the nextstrain.org server in
production.

.. note::

    In this document, the nextstrain.org server is also referred to as the "Node.js
    server", "the app", the "app server", or just "the server".


Invocation
==========

The Node.js server should be invoked as::

    node server.js

and run under process supervision (e.g. systemd).  The working directory need
not be the codebase's root directory.


Configuration
=============

The Node.js server must be run with::

    NODE_ENV=production

set in the environment to put the server into production mode.  The default
development mode is not suitable nor secured for production.

Additional configuration is done with environment variables and/or fields in a
JSON config file.  All configuration variables take their values from the
environment.  Some also take values from the config file when the variable is
missing from the environment.

The default config file in production is :file:`env/production/config.json`.
An alternative path is given by setting::

    CONFIG_FILE=<path>

in the environment.


Reverse proxy
=============

Nginx, Apache, or another production-ready web server must sit in front of the
Node.js server and reverse proxy to it.

The reverse proxy is responsible for terminating TLS and, if desired,
rate-limiting requests.

The reverse proxy must add a few conventional headers to each request which
allow the app to know under what client-facing URL it's being accessed (and by
which actual client IP):

.. parsed-literal::

    `X-Forwarded-For <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For>`__: *<client-addr>*
    `X-Forwarded-Host <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host>`__: *<host>*
    `X-Forwarded-Proto <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto>`__: https

The configuration for adding these headers depends on the fronting web server.

The Node.js server should not be directly accessible on the network.  It should
only be accessible via the reverse proxy.


S3
==

Amazon S3 or an alternative S3-compatible object store is required for
Nextstrain Groups data storage.

The `GROUPS_BUCKET` environment variable or config file field may be used to
override the default bucket name of `nextstrain-groups`.

The standard AWS credential sources are used, e.g. environment variables,
credential and profile files, instance metadata, etc.  Environment variables
are the typical choice, including:

.. parsed-literal::

    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY
    *AWS_SESSION_TOKEN*
    *AWS_REGION*

Variable names in italics may not be necessary for all configurations.

If using an alternative S3-compatible object store, point the server at its
endpoint with::

    AWS_ENDPOINT_URL_S3=https://…

set in the environment.


Redis
=====

Redis 6 is required for session storage and related data.  It must be
configured with persistence_ enabled (preferrably both RDB and AOF) and a
specific `key eviction policy`_::

    maxmemory-policy volatile-ttl

Connection details are provided to the Node.js server by setting::

    REDIS_URL=rediss://u:<password>@<host>:<port>

in the environment.

TLS (i.e. the `rediss` protocol) is required, but certificate host name
checking is not enabled so a self-signed certificate may be used.  User
authentication is recommended but not required.

.. _persistence: https://redis.io/docs/management/persistence/
.. _key eviction policy: https://redis.io/docs/reference/eviction/#eviction-policies


Session encryption
==================

Session data stored in Redis is encrypted.  The encryption key(s) are provided
as a URL query string by setting::

    SESSION_ENCRYPTION_KEYS=<name>=<value>[&<name>=<value>[…]]

in the environment.  The `<name>` of each key must be unique but is for your
identification purposes only.  It must be URL-encoded as necessary.  The
`<value>` of each key must be 32 bytes (256 bits) securely generated from a
random source and then encoded with base64url_.  For example, such values
can be generated using the nextstrain.org codebase like so::

    node -e 'import("./src/cryptography.js").then(({randomKey}) => console.log(randomKey()))'

Or via other Unix programs::

    openssl rand 32 | base64url | sed -e 's/=*$//'

The encryption keys should be treated as sensitive secrets.  Multiple keys may
be provided to support key rotation.  All keys are used for decryption, but
only the first key is used for encryption.

.. _base64url: https://datatracker.ietf.org/doc/html/rfc4648#section-5


Session cookie signatures
=========================

Session ids stored in cookies are secured from tampering via signing.  A secret
is required for such signing and is provided by setting::

    SESSION_SECRET=<value>

in the environment or config file.  The `<value>` should be a long random
string and can be generated the same way as encryption keys above.

Multiple signing secrets may be provided to support secret rotation.  Use a
JSON-encoded array of strings to provide multiple secrets, e.g.::

    SESSION_SECRET='["<value1>","<value2>"]'

All secrets are used for signature verification, but only the first secret is
used for signing.


Groups data file
================

The Nextstrain Groups that exist are stored in a JSON data file.  The default
file in production is :file:`env/production/groups.json`.  An alternative path
is given by setting::

    GROUPS_DATA_FILE=<path>

in the environment or config file.  When set in the config file, relative paths
are resolved relative to the directory containing the config file.


Identity provider
=================

An OpenID Connect 1.0 (OIDC) and OAuth 2.0 (OAuth2) identity provider (IdP) is
required for user authentication and authorization role groups.

Automatic discovery of OIDC metadata from the IdP is supported, so the most
common configuration variables that need setting via the environment or config
file are::

    OIDC_IDP_URL
    OAUTH2_CLIENT_ID
    OAUTH2_CLIENT_SECRET
    OAUTH2_CLI_CLIENT_ID
    OIDC_USERNAME_CLAIM
    OIDC_GROUPS_CLAIM

Discovered metadata can be overridden piecemeal (by setting, e.g.,
`OAUTH2_LOGOUT_URL` to override just that metadata field) or wholesale (by
setting `OIDC_CONFIGURATION` to override the whole metadata JSON document).

See :file:`src/config.js` for details on these configuration variables and
other related variables.

Clients
-------

Two OAuth 2.0 clients (sometimes called "applications") must be registered with
the IdP.

A `confidential, web application client <oauth2-clients_>`__ is required for
use by the app server to implement browser-based sessions.  Its id and secret
are configured by `OAUTH2_CLIENT_ID` and `OAUTH2_CLIENT_SECRET`.  The app
server does not strictly require a secret.  The client registration must allow:

  - the authorization code flow, ideally with PKCE_ support

  - issuance of refresh tokens, either by default or by requesting the
    `offline_access` scope

  - an authentication redirection (sometimes "callback") URL of
    `https://<host>/logged-in`

  - a logout redirection URL of `https://<host>`

Token lifetimes for this client should be configured with consideration that
the id token lifetime affects how often background renewal requests are
necessary and the refresh token lifetime limits the maximum duration of web
sessions.

A `public, native application client <oauth2-clients_>`__ is required for use
by the :doc:`Nextstrain CLI <cli:index>` and is permitted by the app server to
make `Bearer`-authenticated requests.  Its id is configured by
`OAUTH2_CLI_CLIENT_ID`.

.. note::
    Currently Nextstrain CLI is tightly bound to AWS Cognito and requires
    its Secure Remote Password authentication flow implemented outside of
    the standard OAuth 2.0 flows.  We anticipate changing this in the
    future.

.. _oauth2-clients: https://datatracker.ietf.org/doc/html/rfc6749#section-2.1
.. _PKCE: https://datatracker.ietf.org/doc/html/rfc7636


Authorization role groups
-------------------------

The IdP must provide a list of authorization role groups for each user in the
id token.  The app server is configured with the name of this claim field by
`OIDC_GROUPS_CLAIM`.

Authorization role groups are formed by the combination of a Nextstrain Group
name with the generic role name::

    ${normalizedGroupName}/${roleName}

Nextstrain Group names are normalized to lowercase [#]_.  The generic role
names are `viewers`, `editors`, and `owners`.

As an example::

    spheres/editors

is the authorization role group name for the `SPHERES` Nextstrain Group's
`editors` role.


.. [#] And technically Unicode NFKC before lowercasing, though this is
       currently irrelevant given other restrictions on valid names.


CA certificates
===============

The Node.js server makes many outgoing connections over TLS and requires remote
certificates to be issued by a trusted CA.

If running on a network which interposes an internal CA in the middle of TLS
connections, the Node.js server must be configured to trust that internal CA.
Generally the internal CA's root certificate should be *added to* (rather than
replace) an existing bundle of standard trusted CAs.  This can be done a
variety of ways depending on the operating system (e.g. Ubuntu vs. RHEL).
Consult the OS documentation.

Once the internal CA is trusted by the operating system, the Node.js server
needs to be configured to use the operating system's CAs instead of its own
included list of CAs.  This can also be done a variety of ways, but the typical
way is to run the server with::

    NODE_OPTIONS=--use-openssl-ca

set in the environment.  Alternatively, invoke the `node` process with that
option directly.

If adding to the system's CAs isn't possible, an alternative bundle of CAs can
be specified to OpenSSL (and thus Node.js) with::

    SSL_CERT_FILE=/path/to/ca-bundle-with-internal.crt

set in the environment.

See the Node.js documentation for |--use-openssl-ca|_, |NODE_OPTIONS|_, and
|SSL_CERT_FILE|_ for more information.

.. |--use-openssl-ca| replace:: `--use-openssl-ca`
.. _--use-openssl-ca: https://nodejs.org/docs/latest-v16.x/api/cli.html#--use-bundled-ca---use-openssl-ca

.. |NODE_OPTIONS| replace:: `NODE_OPTIONS`
.. _NODE_OPTIONS: https://nodejs.org/docs/latest-v16.x/api/cli.html#node_optionsoptions

.. |SSL_CERT_FILE| replace:: `SSL_CERT_FILE`
.. _SSL_CERT_FILE: https://nodejs.org/docs/latest-v16.x/api/cli.html#ssl_cert_filefile
