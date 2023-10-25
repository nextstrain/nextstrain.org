========
Sessions
========

Each request has an associated session object (``req.session``).  If the
session object is modified during the request, then a *persistent* session is
established at the end of the request by sending a cookie to the browser and
setting a key in Redis (see :ref:`session-storage`).  If unmodified, the
session object is considered ephemeral and not stored.

Persistent sessions are currently only established when initiating interactive
login.  While in most cases login is then completed successfully and the
session becomes an *authenticated* session (i.e. it's associated with a logged
in user), some unauthenticated sessions do exist.

The rest of this document applies to *persistent* sessions (not ephemeral
sessions), primarily those that are *authenticated*.


Contents
========

Sessions primarily contain:

User authn tokens
    OAuth2 id, access, and refresh tokens provided by Cognito after interactive
    login and renewed automatically as needed by us.  If available, then the
    tokens are used to reconstruct the request user object (``req.user``) and
    the session-stored user object is ignored.

    Managed by our own authn layer.

User object
    Serialized representation of the request user object (``req.user``), if the
    session is authenticated.  User objects undergo a separate
    serialization/deserialization step before session
    serialization/deserialization.  Only used to reconstruct the ``req.user``
    if the session predates storing user tokens.

    Managed by ``passport`` (e.g. by calling ``req.login(…)``).

Cookie metadata
    Details about the last cookie sent to the browser.

    Managed mostly by the ``express-session`` middleware.


.. _session-storage:

Storage
=======

Client
------

Session ids are stored in the browser in a ``nextstrain.org-session`` cookie.
Ids are signed using a secret known only to the server
(:envvar:`SESSION_SECRET`) to prevent tampering.

Server
------

Session objects are stored in Redis under keys like
``nextstrain.org-session:${session.id}``.  Objects are serialized/deserialized
as JSON.

.. note::
    If Redis is not configured (e.g. in local development or single-instance
    production), then sessions are stored on the filesystem under
    :file:`sessions/{session.id}.json`.


Lifetime
========

Sessions have a rolling expiration of 30 days, reset on each request.  TTLs are
applied to both the cookie and to the Redis keys.

.. note::
    While a session's TTL is updated on every request, the serialized session
    objects themselves are only updated when necessary to avoid unnecessary
    writes.


Security
========

Client
------

The primary client-side risks to sessions are:

- Session hijacking (theft of cookie)
- Confused deputy attacks, clickjacking, etc. (abuse of cookie)

In order to lower the risk of these, the session cookie is marked with several
attributes that together minimize its visibility/use:

- ``Secure`` to forbid transmission over HTTP and require HTTPS
  (`reference <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#secure>`__)

- ``HttpOnly`` to forbid access by JavaScript
  (`reference <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#httponly>`__)

- ``SameSite=Lax`` to forbid transmission in cross-site subrequests (e.g. when
  embedded in an iframe on another site) but permit transmission on navigation
  (e.g. when clicking a link to nextstrain.org from another site)
  (`reference <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite#lax>`__)

However, the cookie is also marked with one attribute that **broadens** its
visibility a bit:

- ``Domain=nextstrain.org`` to allow transmission to all subdomains of
  nextstrain.org (e.g. share sessions across next.nextstrain.org and
  nextstrain.org)
  (`reference <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#domaindomain-value>`__)

The risk added by the ``Domain`` attribute is because the cookie will also be
sent to subdomains hosted by third-party services, like docs.nextstrain.org,
support.nextstrain.org, and others.  While we do "trust" these providers, they
increase the surface area for potential session hijacking via cookie theft.
One big mitigation is that the cookie is HTTPS-only, so client-side JavaScript
injections via those providers (which are much much more likely than
server-side injections) still couldn't access the cookie.  All together, this
added risk seems acceptable and worth the UX improvement of session sharing.

Future protections
^^^^^^^^^^^^^^^^^^

To remove the third-party subdomain risk, we could:

- move our internal services off the user-facing domain (e.g. use
  support.nextstrain-team.org or support.nextstrain.dev instead).
  
- accomplish session portability another way (e.g. explicit SSO by
  next.nextstrain.org against nextstrain.org as an IdP instead of implicit SSO
  via session sharing).


Server
------

The primary server-side risks to sessions (excluding authn/authz bugs) are
theft or leakage of sensitive session data from Redis.  Sensitive data stored
in sessions includes:

Session ids
    Sensitive because they would form the basis for session hijacking or session
    fixation.

User authn tokens
    Sensitive because they have the future potential to (although do not
    currently) provide access to:

    - nextstrain.org to see private data or make changes to data (but currently
      Bearer authn is only accepted for the Nextstrain CLI's client id)

    - our AWS Cognito user pool to modify the user's own Cognito record (but
      currently the ``aws.cognito.signin.user.admin`` scope is not granted)

    They also embed some private user info like email and name (and potentially
    phone, if set).

Access to this stored data requires authentication with a long random password.
Data is protected in transit between the nextstrain.org server and Redis by
TLS.  The Redis instance listens on a public IP and uses a self-signed cert,
neither of which are ideal, but unfortunately these are out of our immediate
control.

Layered protections exist to reduce the consequences of session data leakage,
theft, or modification (e.g. by a breach of our Redis instance) if it did
happen:

- Direct re-use of the session ids in Redis is not possible since session ids
  in cookies must be signed using a secret known only to the server
  (:envvar:`SESSION_SECRET`).

- Authn tokens are encrypted at rest in Redis using symmetric AES-GCM
  encryption with 256-bit keys known only to the server
  (:envvar:`SESSION_ENCRYPTION_KEYS`) and derived data keys.  Encryption
  context is used to ensure that the encrypted keys can't be copied from one
  session to another by someone who can modify session data.  See the comments
  at the top of :file:`src/cryptography.js` for more details on the encryption
  choices.

Future protections
^^^^^^^^^^^^^^^^^^

To remove the unnecessary risks of Redis listening on a public IP and using a
TLS cert we cannot verify, we'd have to (in rough order of increasing effort):

- pay for Heroku's VPC feature, Private Spaces, which is Enterprise-only (and
  thus likely $$$).

- switch PaaS providers away from Heroku to Render or Fly.io, both of which
  support internal-only services and offer managed Redis (but lose some nice
  Heroku features, like pipelines/promotion).

- run Redis ourselves as a sidecar dyno on Heroku and setup our own VPC overlay
  network with something like Tailscale.

None of these seem worth it at the current time all things considered.


Environment variables
=====================

.. envvar:: SESSION_SECRET

    Must be set to a long, securely-generated string.  It protects the session
    data stored in browser cookies.  Changing this will invalidate all existing
    sessions and forcibly logout people.

    Outside of production mode, this env var is **ignored** and the secret is
    an insecure fixed string.

.. envvar:: SESSION_ENCRYPTION_KEYS

    Must be set to a URL query param string encoding pairs of key names and
    base64-encoded key material.  These keys protect sensitive data in the
    session (such as authn tokens) when session data is "at rest" (such as in
    Redis).  You may prepend new keys to use for new sessions (i.e. key
    rotation) but do not drop old keys or old sessions will be unusable and
    people will be forcibly logged out.  Keys must be 256 bits in length.

    Outside of production mode, if this env var is not provided then a randomly
    generated key is used.
