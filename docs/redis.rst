=====
Redis
=====

The `Heroku Data for
Redis <https://elements.heroku.com/addons/heroku-redis>`__ add-on is
attached to our ``nextstrain-server``, ``nextstrain-canary``, and
``nextstrain-dev`` apps. Redis is used to persistently store login
sessions after authentication via `AWS Cognito <#cognito>`__. A
persistent data store is important for preserving sessions across
deploys and regular dyno restarts.

.. note::

   This amounts to using Redis as a database rather the more
   common approach of using it as a cache.

Maintenance
===========

`Heroku
docs <https://devcenter.heroku.com/articles/heroku-redis-maintenance>`__

Heroku will automatically perform minor maintenance tasks such as
patching the operating system or required libraries. Email notifications
will be sent for these, typically with a subject line of **Maintenance
required on your Redis add-on (REDIS on nextstrain-server)**. These are
expected to just work. In case any issues arise, the scheduled
maintenance window (Friday at 22:00 UTC to Saturday at 02:00 UTC) tries
to optimize for being `outside/on the fringes of business
hours <https://www.timeanddate.com/worldclock/meetingdetails.html?year=2020&month=1&day=24&hour=22&min=0&sec=0&p1=1229&p2=136&p3=179&p4=234&p5=22&p6=33&p7=121>`__
in relevant places around the world while being in US/Pacific business
hours so the Seattle team can respond.

Upgrading the add-on version
----------------------------

Heroku occasionally releases a new major version of the add-on. When
this happens, the oldest supported version is deprecated. Based on
previous upgrades and `projected end-of-life
dates <https://devcenter.heroku.com/articles/heroku-redis#version-support-and-legacy-infrastructure>`__,
this happens about once every 1.5-2 years.

When this happens, Heroku begins sending deprecation notices via email.
Steps to ensure a smooth upgrade are detailed below. They have been
adapted from @tsibley's `notes on the 5 → 6
upgrade <https://github.com/tsibley/blab-standup/blob/17eb1690b70ca25aa7be7526b7e140e43cf0a1e6/2023-02-17.md>`__,
which is based on the ``--fork`` `upgrade method
<https://devcenter.heroku.com/articles/heroku-redis-version-upgrade#upgrade-using-a-fork>`__
described in Heroku's own documentation.

.. warning::

   Instead of entering maintenance mode for the whole site (as suggested
   by Heroku's docs), we'll instead put it into a slightly degraded
   state by removing (read/write) access to Redis.

   This won't affect access to public resources, but will affect anyone
   with an existing login session or establishing a new login session
   during the very brief switchover window:

   - Any group member change made via the RESTful API (`{PUT, DELETE}
     /groups/{name}/settings/roles/{role}/members/{username}`) during the period
     will lose the "userStaleBefore" mark for the changed member. Users will
     have to manually log out then back in or wait `up to an hour
     <https://github.com/nextstrain/nextstrain.org/blob/88bc40e4115a930b8ead823f48528144cfd35fbc/aws/cognito/clients.tf#L48-L56>`__
     for those changes to take effect.

   -  Existing login sessions will be temporarily "forgotten". They'll
      be "remembered" again after the upgrade.

   -  New login sessions established during the upgrade will be
      permanently forgotten after the upgrade. Anyone unfortunate enough
      to encounter this will need to log in again, although based on
      current usage, it can be expected to affect approximately zero
      people.

   The manual steps come with the benefit of allowing the majority of the site
   to remain usable.

.. warning::

   During each step that causes a restart of the app, web requests may need to
   wait ~30 seconds for a response. There is an `open issue
   <https://github.com/nextstrain/nextstrain.org/issues/768>`__ tracking this
   behavior.

.. note::

   Heroku provides an `in-place upgrade method
   <https://devcenter.heroku.com/articles/heroku-redis-version-upgrade#upgrade-using-redis-upgrade>`__
   that is much simpler than the steps below. However, there is no option to
   roll back in case anything unexpected happens. If we find ourselves going
   through this process more often without any failures and this becomes too
   tedious, it may be worth switching to use the in-place upgrade method.

   See `previous discussion
   <https://github.com/nextstrain/private/issues/121#issuecomment-2330682764>`__
   for tradeoffs between the approaches.

0. Gather information.

   .. code-block:: bash

      # This assumes there is only one instance.
      old_instance=$(heroku addons --app nextstrain-server --json | jq -r '.[] | select(.addon_service.name == "heroku-redis") | .name')
      heroku redis:info "$old_instance" -a nextstrain-server | tee redis-info
      heroku addons:info "$old_instance" | tee redis-addon-info

1. Start a watch session on logs for ``nextstrain-server``:

   .. code-block:: bash

      heroku logs --app nextstrain-server --tail

   .. tip::

      These logs show console output from the server as well as every incoming
      HTTP request. This is inherently noisy, but any messages with
      ``status=5xx`` should be investigated.

      Keep the logs streaming until the update is completed, since ``heroku logs`` is only able to provide the last 1500 messages retrospectively.

      It can also be useful to refresh https://nextstrain.org after every step
      that updates the app to ensure the app is still running as expected.

2. Log in to one of the instances (dev,canary,server) if you are not
   already.

3. Disable the Redis requirement across apps:

   .. code-block:: bash

      for app in nextstrain-{dev,canary,server}; do
          heroku config:set REDIS_REQUIRED=false -a "$app"
      done

4. Disabling writes to Redis by changing its attachment from ``REDIS``
   to ``OLD_REDIS`` on the apps:

   .. code-block:: bash

      for app in nextstrain-{dev,canary,server}; do
          heroku addons:attach --as OLD_REDIS "$old_instance" -a "$app"
          heroku addons:detach REDIS -a "$app"
      done

   .. warning::

      This step causes the site to enter the degraded state described earlier.
      If the need arises, you can roll back to the old instance:

      .. code-block:: bash

         for app in nextstrain-{dev,canary,server}; do
             heroku addons:attach --as REDIS "$old_instance" -a "$app"
             heroku addons:detach OLD_REDIS -a "$app"
         done


5. Create the new, upgraded Redis instance on `nextstrain-server` as a fork
   (snapshot copy) of the old:

   .. code-block:: bash

      heroku addons:create heroku-redis:premium-0 \
          --as NEW_REDIS \
          -a nextstrain-server \
          --fork "$(heroku config:get OLD_REDIS_URL -a nextstrain-server)"

6. Set a variable for the new instance name to be used in subsequent steps:

   .. code-block:: bash

      # Replace value with name from output of previous step
      new_instance="redis-X-N"

7. Wait for it to be ready:

   .. code-block:: bash

      heroku addons:info "$new_instance"

   Its ``State`` will change from ``creating`` to ``created``.

   Check that the fork is done:

   .. code-block:: bash

      heroku redis:info "$new_instance" -a nextstrain-server

   This starts at ``fork in progress`` and is supposed to change once
   completed (forks start as replicas and then switch to primaries), but
   it may appear stuck in that state. If that happens, it should be safe
   to continue as long as all data looks to be transferred. Do this by
   entering Redis CLI (``heroku redis:cli``) on both instances and
   comparing the output of:

   -  ``info keyspace``
   -  ``scan`` (`doc <https://valkey.io/commands/scan/>`__) - start with
      ``scan 0`` and follow the cursor a couple times
   -  a manually issued ``sync`` (`doc <https://valkey.io/commands/sync/>`__)
      jumping over bulk sync and right to live monitor mode

8. Compare settings to the previous instance and adjust as necessary:

   .. code-block:: bash

      heroku redis:info "$new_instance" -a nextstrain-server | tee redis-new-info
      git diff redis{,-new}-info
      # make adjustments with other `heroku redis:…` commands

   These adjustments have been necessary during previous upgrades
   (``data:maintenances:window:update`` requires the `Data Maintenance CLI
   Plugin
   <https://devcenter.heroku.com/articles/data-maintenance-cli-commands>`__):

   .. code-block:: bash

      heroku redis:maxmemory "$new_instance" -a nextstrain-server -p volatile-ttl
      heroku data:maintenances:window:update "$new_instance" Friday 22:00 -a nextstrain-server

9. Use the new Redis instance on across apps:

   .. code-block:: bash

      heroku redis:promote "$new_instance" -a nextstrain-server # attaches as REDIS
      heroku addons:detach NEW_REDIS -a nextstrain-server # removes old NEW_REDIS attachment

      for app in nextstrain-{dev,canary}; do
          heroku addons:attach --as REDIS "$new_instance" -a "$app"
      done

10. Test that the new instance works:

   1. Load the website and check that your login session is now "remembered" again.
   2. Check that you can successfully log out and log back in.
   3. Check that you can remove/add a member from a group.

11. Remove the old Redis instance:

   .. code-block:: bash

      for app in nextstrain-{dev,canary,server}; do
          heroku addons:detach OLD_REDIS -a "$app"
      done
      heroku addons:destroy "$old_instance"

12. Reinstate the Redis requirement across apps:

   .. code-block:: bash

      for app in nextstrain-{dev,canary,server}; do
          heroku config:unset REDIS_REQUIRED -a "$app"
      done

Limitations
===========

If our Redis instance reaches its maximum memory limit, existing keys
will be evicted using the ``volatile-ttl`` `policy
<https://devcenter.heroku.com/articles/heroku-redis#maxmemory-policy>`__
to make space for new keys. This should preserve the most active logged
in sessions and avoid throwing errors if we hit the limit. If we
regularly start hitting the memory limit, we should bump up to the next
add-on plan, but I don't expect this to happen anytime soon with current
usage.
