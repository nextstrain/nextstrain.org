# Infrastructure

## Domains

**nextstrain.org**, **next.nextstrain.org**, and **dev.nextstrain.org** are [hosted on Heroku](#heroku).

**data.nextstrain.org** is an AWS CloudFronted S3 bucket, [`nextstrain-data`](#nextstrain-data).

**staging.nextstrain.org** is an AWS CloudFronted S3 bucket, [`nextstrain-staging`](#nextstrain-staging).

**login.nextstrain.org** is used by our [AWS Cognito user pool](#cognito).

**clades.nextstrain.org** is used by [Nextclade](https://github.com/nextstrain/nextclade).

**docs.nextstrain.org** is a documentation site with [the Nextstrain Read the Docs project](https://readthedocs.org/projects/nextstrain/) and sub-projects.

**support.nextstrain.org** is an email ticketing system powered by [Zoho Desk](https://www.zoho.com/desk/).

**discussion.nextstrain.org** is a discussion forum powered by [Discourse](https://www.discourse.org/).

## Heroku

We use a [Heroku pipeline named `nextstrain-server`](https://dashboard.heroku.com/pipelines/38f67fc7-d93c-40c6-a182-501da2f89d9d) to manage multiple related apps.
The production app serving **nextstrain.org** is [`nextstrain-server`](https://dashboard.heroku.com/apps/nextstrain-server).
The canary app serving **next.nextstrain.org** is [`nextstrain-canary`](https://dashboard.heroku.com/apps/nextstrain-canary).
Deploys of `master` to the canary app happen automatically after [GitHub Actions CI tests](https://github.com/nextstrain/nextstrain.org/actions/workflows/ci.yml) are successful.
Deploys to the production app are performed by manually [promoting](https://devcenter.heroku.com/articles/pipelines#promoting) the canary's current release to production (see also more about promoting below).

### Environment (or config) variables

  - `NODE_ENV` is used to condition behaviour between production and non-production environments, following the widely-used convention set by Express.
    Its value affects not just the explicit conditionals in this repo but also Express and other layers in our dependencies.
    All our Heroku apps [run under `NODE_ENV=production`](https://devcenter.heroku.com/articles/nodejs-support#runtime-behavior).

  - `SESSION_SECRET` must be set to a long, securely generated string.
    It protects the session data stored in browser cookies.
    Changing this will invalidate all existing sessions and forcibly logout people.

  - `SESSION_ENCRYPTION_KEYS` must be set to a URL query param string encoding pairs of key names and base64-encoded key material.
    These keys protect sensitive data in the session (such as authn tokens) when session data is "at rest" (such as in Redis).
    You may prepend new keys to use for new sessions (i.e. key rotation) but do not drop old keys or old sessions will be unusable and people will be forcibly logged out.
    Keys must be 256 bits in length.

  - `SESSION_COOKIE_DOMAIN` is set when necessary to allow sharing of session cookies between parent and subdomains, e.g. nextstrain.org and next.nextstrain.org.

  - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are tied to the `nextstrain.org` AWS IAM user.
    These credentials allow the backend web server limited access to private S3 buckets.

  - `AWS_REGION` should be set to the region containing S3 buckets.
    This is `us-east-1` for production and testing.

  - `REDIS_URL` is provided by the Heroku Redis add-on.
    It should not be modified directly.
    Our [authentication handlers](../src/authn/index.js) rewrite it at server start to use a secure TLS connection.

  - `FETCH_CACHE` is not currently used, but can be set to change the location of the on-disk cache used by (some) server `fetch()`-es.
    The default location is `/tmp/fetch-cache`.

  - `PAPERTRAIL_API_TOKEN` is used for logging through [papertrail](https://elements.heroku.com/addons/papertrail).

  - `GITHUB_TOKEN` is used to make authenticated requests to the GitHub API so that we get increased rate limits and can download workflow artifacts.
    The token should be a [fine-grained personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-fine-grained-personal-access-token) with public access only, i.e. no specific respositories or permissions granted.
    If not provided, requests to the GitHub API are unauthenticated.
    The token we use in production is associated with the `nextstrain-bot` GitHub user.

  - `CANARY_ORIGIN` is the origin of a canary deployment to redirect to for users who are opted-in to the `canary` flag (the `!flags/canary` Cognito group).
    Redirection does not happen if this variable is not defined or if the request's origin already matches this variable's value.
    In production we set this to `https://next.nextstrain.org`.

  - `CONFIG_FILE` is the path to a JSON file defining the defaults for the required variables below.
    If not provided, the checked-in files `env/production/config.json` and `env/testing/config.json` are used (depending on the value of `NODE_ENV`).

  - `USE_PREBUILT_STATIC_SITE` is useful for development purposes and allows you to run the static site (sometimes referred to as the "frontend" or the "Next.js site") using pre-built assets, which is how it behaves in production mode.
    In the absence of this variable the `NODE_ENV` is used to decide whether to use pre-built assets ("production mode") or compile assets as requested ("development mode").
    If `NODE_ENV="production"` then `USE_PREBUILT_STATIC_SITE` has no effect.
    (P.S. to use prebuilt assets they must first be built, typically via `npm run build`.)

  - `DEBUG` controls debug-level logging output from our own codebase as well as many of our deps (e.g. Express and its related packages).
    As examples, to see the output from our own code, set `DEBUG=nextstrain:*`; to also see the output from the [`compression` module](https://www.npmjs.com/package/compression), set `DEBUG=nextstrain:*,compression`.
    Refer to the [`debug` module documentation](https://www.npmjs.com/package/debug) for more information.


Several variables are required but obtain defaults from a config file (e.g. `env/production/config.json`):

  - `COGNITO_USER_POOL_ID` must be set to the id of the Cognito user pool to use for authentication.

  - `OIDC_IDP_URL` must be set to the URL of the Cognito user pool's IdP endpoint.
    This is something like `https://cognito-idp.{REGION}.amazonaws.com/{REGION}_{ID}`.

  - `OAUTH2_CLIENT_ID` must be set to the OAuth2 client id for the nextstrain.org client registered with the Cognito user pool.

  - `OAUTH2_CLI_CLIENT_ID` must be set to the OAuth2 client id for the Nextstrain CLI client registered with the Cognito user pool.

  - `OAUTH2_LOGOUT_URL` overrides any value discovered via IdP metadata.
    For Cognito, which doesn't provide a value via metadata, this must be set to the logout URL of the Cognito user pool's hosted UI.
    In production, this is `https://login.nextstrain.org/logout`.
    In development and testing, this would be something like `https://nextstrain-testing.auth.us-east-1.amazoncognito.com/logout`.

  - `OIDC_USERNAME_CLAIM` must be set to the field in the id token claims which contains the username for a user.
    For Cognito, this is `cognito:username`.

  - `OIDC_GROUPS_CLAIM` must be set to the field in the id token claims which contains the list of group names for a user.
    For Cognito, this is `cognito:groups`.

  - `GROUPS_DATA_FILE` is the path to a JSON file defining the known Groups.
    Our config files point to the checked-in files `env/production/groups.json` and `env/testing/groups.json`.

Variables in the environment override defaults from the config file.

### Redis add-on

See [redis.md](./redis.md).

### Logs

Server logs are available via the [papertrail web app](https://my.papertrailapp.com/systems/nextstrain-server/events) (requires heroku login).
The dev server does not have papertrail enabled, but logs may be viewed using the heroku CLI via `heroku logs --app=nextstrain-dev --tail`.

### Development server

A testing app, `nextstrain-dev`, is also used, available at [dev.nextstrain.org](https://dev.nextstrain.org/).
Deploys to it are manual, via the dashboard or [git pushes to the Heroku remote](https://devcenter.heroku.com/articles/git), e.g. `git push -f heroku-dev <branch>:master`, where the `heroku-dev` remote is https://git.heroku.com/nextstrain-dev.git.
Note that the dev server runs in production mode (`NODE_ENV=production`), and also uses the `nextstrain.org` AWS IAM user.

### Review apps

We use [Heroku Review Apps](https://devcenter.heroku.com/articles/github-integration-review-apps) to create ephemeral apps for PRs to the [GitHub repo](https://github.com/nextstrain/nextstrain.org).
These are automatically created for PRs submitted by Nextstrain team members.
To recreate an inactivated app, or create one for a PR from a fork, you can use the heroku dashboard.
(Make sure to review code for security purposes before creating such an app.)

> It is not currently possible to login/logout of these apps due to our AWS Cognito setup; thus private datasets cannot be accessed.

### Promoting changes

Promoting changes from canary to production can be done freely at any time, however it's worth reviewing the changes you're promoting to make sure they are what you expect them to be.

To inspect the differences between canary (next.nextstrain.org) and production (nextstrain.org), [login to Heroku](https://dashboard.heroku.com/teams/nextstrain/apps) and click "nextstrain-server", find "nextstrain-canary", click "Promote to production" (this just opens a popup), and "Compare on GitHub".

We have a linear deploy path from git → canary → production, so if your commit Y in git comes after commit X, then deploying/promoting commit Y also deploys/promotes commit X.
(Any out-of-order alternatives, though possible, are considered unnecessary complication for our team for now.)
If you're promoting someone else's prior changes along with your own, it doesn't hurt to give a heads up in the `#nextstrain-dev` channel.
That said, if someone leaves changes lying around on the canary for any length of time, that someone should expect the changes might be promoted to prod by someone else.
So if you don't want that for your own changes, then make sure to promote them yourself sooner than later or ask folks to hold off while you let your changes bake off for a bit.

It's worth noting that it is possible to promote previous releases to the canary to prod using the Heroku API (and maybe CLI?) but not the web UI.
This might be useful if there are some lower stakes prior changes you want to promote before some higher stakes later changes but you didn't get a chance to before the latter deployed to the canary.

### Rolling back deployments

In case of issues with a deployment, Heroku allows us to immediately return to a previous version using rollbacks, which take only several seconds to take effect.
Normal Heroku deployments, performed by our GitHub Actions CI workflow, take about 6 minutes, and so, for time-sensitive issues, "failing forward" with a reversion in Git and new deploy, if appropriate, should be done after a rollback.
Rollbacks can be performed via the Heroku dashboard or with `heroku rollback --app=nextstrain-server vX`, where _X_ is the version number (available via `heroku releases --app=nextstrain-server`).

## AWS

All resources are in the `us-east-1` region.
If you don't see them in the AWS Console, make sure to check the region you're looking at.

## S3 buckets

### nextstrain-data

Public.
CloudFronted.
Contains JSONs for our core builds, as well as the [`nextstrain.yml` conda environment](https://github.com/nextstrain/conda) definition.
Fetches by the server happen over unauthenticated HTTP.

### nextstrain-staging

Public.
CloudFronted.
Contains JSONs for staging copies of our core builds.
Fetches by the server happen over unauthenticated HTTP.

### nextstrain-groups

Private.
Contains data for all groups.
Fetches by the server happen via the S3 HTTP API using signed URLs.

## EC2 instances

**rethink.nextstrain.org** hosts the lab's [fauna](https://github.com/nextstrain/fauna) instance, used to maintain data for the core builds.

Ephemeral instances are automatically managed by AWS Batch for `nextstrain build --aws-batch` jobs.

## Cognito

A [_user pool_](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html) called `nextstrain.org` provides authentication for Nextstrain logins.
Cognito is integrated with the nextstrain.org server using the OAuth2 support from PassportJS in our [`authn/index.js`](../src/authn/index.js) file.

We don't use Cognito's [_identity pools_](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html).

## DNS

Nameservers for the nextstrain.org zone are hosted by [DNSimple](https://dnsimple.com/a/89964/domains/nextstrain.org).

## GitHub

[nextstrain/nextstrain.org](https://github.com/nextstrain/nextstrain.org) is the GitHub repo for the Nextstrain website.

Core and staging narratives are sourced from the [nextstrain/narratives](https://github.com/nextstrain/narratives) repo (the `master` and `staging` branches, respectively).

## CI

CI tests and deployments are run via [GitHub Actions](https://github.com/nextstrain/nextstrain.org/actions) using our [CI workflow](https://github.com/nextstrain/nextstrain.org/blob/master/.github/workflows/ci.yml).
Any push or PR will trigger CI tests.
Pushes to the `master` branch will trigger a CI deployment after tests pass.
