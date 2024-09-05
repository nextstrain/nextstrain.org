# Redis

The [Heroku Data for Redis](https://elements.heroku.com/addons/heroku-redis) add-on is attached to our `nextstrain-server`, `nextstrain-canary`, and `nextstrain-dev` apps.
Redis is used to persistently store login sessions after authentication via [AWS Cognito](#cognito).
A persistent data store is important for preserving sessions across deploys and regular dyno restarts.

> [!NOTE]
> This amounts to using Redis as a database rather the more common approach of using it as a cache.

## Maintenance

[Heroku docs](https://devcenter.heroku.com/articles/heroku-redis-maintenance)

Heroku will automatically perform minor maintenance tasks such as patching the operating system or required libraries.
Email notifications will be sent for these, typically with a subject line of **Maintenance required on your Redis add-on (REDIS on nextstrain-server)**.
These are expected to just work. In case any issues arise, the scheduled maintenance window (Friday at 22:00 UTC to Saturday at 02:00 UTC) tries to optimize for being [outside/on the fringes of business hours](https://www.timeanddate.com/worldclock/meetingdetails.html?year=2020&month=1&day=24&hour=22&min=0&sec=0&p1=1229&p2=136&p3=179&p4=234&p5=22&p6=33&p7=121) in relevant places around the world while being in US/Pacific business hours so the Seattle team can respond.

### Upgrading the add-on version

Heroku occasionally releases a new major version of the add-on. When this happens, the oldest supported version is deprecated.
Based on previous upgrades and [projected end-of-life dates](https://devcenter.heroku.com/articles/heroku-redis#version-support-and-legacy-infrastructure), this happens about once every 1.5-2 years.

When this happens, Heroku begins sending deprecation notices via email. Steps to ensure a smooth upgrade are detailed below.
They have been adapted from @tsibley's [notes on the 5 → 6 upgrade](https://github.com/tsibley/blab-standup/blob/17eb1690b70ca25aa7be7526b7e140e43cf0a1e6/2023-02-17.md),
which is based on the [`--fork` upgrade method](https://devcenter.heroku.com/articles/heroku-redis-version-upgrade#upgrade-using-a-fork) described in Heroku's own documentation.

 0. Gather information.

        # This assumes there is only one instance.
        old_instance=$(heroku addons --app nextstrain-server --json | jq -r '.[] | select(.addon_service.name == "heroku-redis") | .name')
        heroku redis:info "$old_instance" -a nextstrain-server | tee redis-info
        heroku addons:info "$old_instance" | tee redis-addon-info

 1. Log in to one of the instances (dev,canary,server) if you are not already.

 2. Disabling writes to Redis by changing its attachment from `REDIS` to
    `OLD_REDIS` on the apps:

        for app in nextstrain-{dev,canary,server}; do
            heroku addons:attach --as OLD_REDIS "$old_instance" -a "$app"
            heroku addons:detach REDIS -a "$app"
        done

    Instead of entering maintenance mode for the whole site (as suggested by
    Heroku's docs), we'll instead put it into a slightly degraded state by
    removing (read/write) access to Redis.

    This won't affect access to public resources, but will affect anyone with
    an existing login session or establishing a new login session during the
    very brief switchover window:

      - Existing login sessions will be temporarily "forgotten".  They'll be
        "remembered" again after the upgrade.

      - New login sessions established during the upgrade will be permanently
        forgotten after the upgrade.  Anyone unfortunate enough to encounter
        this will need to log in again, although based on current usage, it can
        be expected to affect approximately zero people.

    This extra step comes with the benefit of allowing the majority of the site
    to remain usable.

 3. Create the new, upgraded Redis instance as a fork (snapshot copy) of the old:

        heroku addons:create heroku-redis:premium-0 \
            --as NEW_REDIS \
            -a nextstrain-server \
            --fork "$(heroku config:get REDIS_URL -a nextstrain-server)"

    <!-- TODO: put new instance name in a variable -->

 4. Wait for it to be ready:

        heroku addons:info redis-X-N

    Its `State` will change from `creating` to `created`.

    Check that the fork is done:

        heroku redis:info redis-X-N

    This starts at `fork in progress` and is supposed to change once completed
    (forks start as replicas and then switch to primaries), but it may appear
    stuck in that state. If that happens, it should be safe to continue as long
    as all data looks to be transferred. Do this by entering Redis CLI (`heroku
    redis:cli`) on both instances and comparing the output of:

    - `info keyspace`
    - [`scan`](https://valkey.io/commands/scan/) (start with `scan 0`
      and follow the cursor a couple times)
    - a manually issued [`sync`](https://valkey.io/commands/sync/) jumping over
      bulk sync and right to live monitor mode

 5. Compare settings to the previous instance and adjust as necessary:

        heroku redis:info redis-X-N | tee redis-new-info
        git diff redis{,-new}-info
        # make adjustments with other `heroku redis:…` commands

    During the 5 → 6 upgrade, `maxmemory` had to be adjusted:

        heroku redis:maxmemory redis-X-N -a nextstrain-server -p volatile-ttl

 6. Replace the old Redis instance with the new one:
 
        for app in nextstrain-{dev,canary,server}; do
            heroku redis:promote redis-X-N -a "$app" # attaches as REDIS
            heroku addons:detach NEW_REDIS -a "$app" # removes old NEW_REDIS attachment
        done

 7. Test that your login session is now "remembered" again.

 8. Remove the old Redis instance:

        for app in nextstrain-{dev,canary,server}; do
            heroku addons:detach OLD_REDIS -a "$app"
        done
        heroku addons:destroy "$old_instance"

## Limitations

If our Redis instance reaches its maximum memory limit, existing keys will be evicted using the [`volatile-ttl` policy](https://devcenter.heroku.com/articles/heroku-redis#maxmemory-policy) to make space for new keys.
This should preserve the most active logged in sessions and avoid throwing errors if we hit the limit.
If we regularly start hitting the memory limit, we should bump up to the next add-on plan, but I don't expect this to happen anytime soon with current usage.
