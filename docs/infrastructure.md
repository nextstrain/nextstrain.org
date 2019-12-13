# Infrastructure

## Domains

**nextstrain.org** is [hosted on Heroku](#heroku).

**data.nextstrain.org** is an AWS CloudFronted S3 bucket, [`nextstrain-data`](#nextstrain-data).

**staging.nextstrain.org** is an AWS CloudFronted S3 bucket, [`nextstrain-staging`](#nextstrain-staging).

**login.nextstrain.org** is used by our [AWS Cognito user pool](#cognito).

## Heroku

The production Heroku app is [`nextstrain-server`](https://dashboard.heroku.com/apps/nextstrain-server), which is part of a [Heroku app pipeline of the same name](https://dashboard.heroku.com/pipelines/38f67fc7-d93c-40c6-a182-501da2f89d9d).
Deploys of `master` happen automatically after Travis CI tests are successful.

A testing/staging app, `nextstrain-dev`, is also used.

### Environment variables

  - `SESSION_SECRET` must be set to a long, securely generated string.
    It protects the session data stored in browser cookies.
    Changing this will invalidate all existing sessions and forcibly logout people.

  - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are tied to the `nextstrain.org` AWS IAM user.
    These credentials allow the backend web server limited access to private S3 buckets.

  - `REDIS_URL` is provided by the Heroku Redis add-on.
    It should not be modified directly.
    Our [authentication handlers](../authn.js) rewrite it at server start to use a secure TLS connection.

### Add-ons

The [Heroku Redis](https://elements.heroku.com/addons/heroku-redis) add-on is attached to our `nextstrain-server` and `nextstrain-dev` apps.
Redis is used to persistently store login sessions after authentication via [AWS Cognito](#cognito).
A persistent data store is important for preserving sessions across deploys and regular dyno restarts.

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
Cognito is integrated with the nextstrain.org server using the OAuth2 support from PassportJS in our [`authn.js`](../authn.js) file.

We currently don't use Cognito's [_identity pools_](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html).
It may be beneficial to use one in the future so we can get temporary AWS credentials specific to each Nextstrain user with the appropriate authorizations baked in (instead of using a server-wide set of credentials).

## DNS

Nameservers for the nextstrain.org zone are hosted by [DNSimple](https://dnsimple.com/a/89964/domains/nextstrain.org).

## GitHub

[nextstrain/nextstrain.org](https://github.com/nextstrain/nextstrain.org) is the GitHub repo for the Nextstrain website.

Core and staging narratives are sourced from the [nextstrain/narratives](https://github.com/nextstrain/narratives) repo (the `master` and `staging` branches, respectively).
