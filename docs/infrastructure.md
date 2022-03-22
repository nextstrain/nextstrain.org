# Infrastructure

## Domains

**nextstrain.org**, **next.nextstrain.org**, and **dev.nextstrain.org** are [hosted on Heroku](#heroku).

**data.nextstrain.org** is an AWS CloudFronted S3 bucket, [`nextstrain-data`](#nextstrain-data).

**staging.nextstrain.org** is an AWS CloudFronted S3 bucket, [`nextstrain-staging`](#nextstrain-staging).

**login.nextstrain.org** is used by our [AWS Cognito user pool](#cognito).

## Heroku

We use a [Heroku pipeline named `nextstrain-server`](https://dashboard.heroku.com/pipelines/38f67fc7-d93c-40c6-a182-501da2f89d9d) to manage multiple related apps.
The production app serving **nextstrain.org** is [`nextstrain-server`](https://dashboard.heroku.com/apps/nextstrain-server).
The canary app serving **next.nextstrain.org** is [`nextstrain-canary`](https://dashboard.heroku.com/apps/nextstrain-canary).
Deploys of `master` to the canary app happen automatically after Travis CI tests are successful.
Deploys to the production app are performed by manually [promoting](https://devcenter.heroku.com/articles/pipelines#promoting) the canary's current release to production.

### Environment variables

  - `NODE_ENV` is used to condition behaviour between production and non-production environments, following the widely-used convention set by Express.
    Its value affects not just the explicit conditionals in this repo but also Express and other layers in our dependencies.
    All our Heroku apps [run under `NODE_ENV=production`](https://devcenter.heroku.com/articles/nodejs-support#runtime-behavior).

  - `SESSION_SECRET` must be set to a long, securely generated string.
    It protects the session data stored in browser cookies.
    Changing this will invalidate all existing sessions and forcibly logout people.

  - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are tied to the `nextstrain.org` AWS IAM user.
    These credentials allow the backend web server limited access to private S3 buckets.

  - `REDIS_URL` is provided by the Heroku Redis add-on.
    It should not be modified directly.
    Our [authentication handlers](../src/authn/index.js) rewrite it at server start to use a secure TLS connection.

  - `FETCH_CACHE` is not currently used, but can be set to change the location of the on-disk cache used by (some) server `fetch()`-es.
    The default location is `/tmp/fetch-cache`.

  - `PAPERTRAIL_API_TOKEN` is used for logging through [papertrail](https://elements.heroku.com/addons/papertrail).

  - `GITHUB_TOKEN` is used to make authenticated requests to the GitHub API so that we get increased rate limits.
    The token should have public access only, i.e. no permission scopes granted (including `public_repo`, which grants write access to public repos).
    If not provided, requests to the GitHub API are unauthenticated.
    The token we use in production is associated with the `nextstrain-bot` GitHub user.

  - `CANARY_ORIGIN` is the origin of a canary deployment to redirect to for users who are opted-in to the `canary` flag (the `!flags/canary` Cognito group).
    Redirection does not happen if this variable is not defined or if the request's origin already matches this variable's value.
    In production we set this to `https://next.nextstrain.org`.

### Redis add-on

The [Heroku Redis](https://elements.heroku.com/addons/heroku-redis) add-on is attached to our `nextstrain-server` and `nextstrain-dev` apps.
Redis is used to persistently store login sessions after authentication via [AWS Cognito](#cognito).
A persistent data store is important for preserving sessions across deploys and regular dyno restarts.

The [maintenance window](https://devcenter.heroku.com/articles/heroku-redis-maintenance) is set to Friday at 22:00 UTC to Saturday at 02:00 UTC.
This tries to optimize for being [outside/on the fringes of business hours](https://www.timeanddate.com/worldclock/meetingdetails.html?year=2020&month=1&day=24&hour=22&min=0&sec=0&p1=1229&p2=136&p3=179&p4=234&p5=22&p6=33&p7=121) in relevant places around the world while being in US/Pacific business hours so the Seattle team can respond to any issues arising.

If our Redis instance reaches its maximum memory limit, existing keys will be evicted using the [`volatile-ttl` policy](https://devcenter.heroku.com/articles/heroku-redis#maxmemory-policy) to make space for new keys.
This should preserve the most active logged in sessions and avoid throwing errors if we hit the limit.
If we regularly start hitting the memory limit, we should bump up to the next add-on plan, but I don't expect this to happen anytime soon with current usage.

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

### Rolling back deployments

Normal heroku deployments, which require TravisCI to pass and are subsequently built on Heroku, can take upwards of 10 minutes.
Heroku allows us to immediately return to a previous version using `heroku rollback --app=nextstrain-server vX`, where X is the version number (available via the heroku dashboard).

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

### nextstrain-inrb

Private.
Access controlled by IAM groups/policies.
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

## Travis CI

CI is run via [TravisCI](https://travis-ci.com/nextstrain/nextstrain.org) using our [.travis.yml](https://github.com/nextstrain/nextstrain.org/blob/master/.travis.yml).
All commits to the master branch on GitHub, or an open PR, will trigger a CI build.
