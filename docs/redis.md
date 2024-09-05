# Redis

The [Heroku Redis](https://elements.heroku.com/addons/heroku-redis) add-on is attached to our `nextstrain-server` and `nextstrain-dev` apps.
Redis is used to persistently store login sessions after authentication via [AWS Cognito](#cognito).
A persistent data store is important for preserving sessions across deploys and regular dyno restarts.

> [!NOTE]
> This amounts to using Redis as a database rather the more common approach of using it as a cache.

## Maintenance

[Heroku docs](https://devcenter.heroku.com/articles/heroku-redis-maintenance)

Heroku will automatically perform minor maintenance tasks such as patching the operating system or required libraries.
Email notifications will be sent for these, typically with a subject line of **Maintenance required on your Redis add-on (REDIS on nextstrain-server)**.
These are expected to just work. In case any issues arise, the scheduled maintenance window (Friday at 22:00 UTC to Saturday at 02:00 UTC) tries to optimize for being [outside/on the fringes of business hours](https://www.timeanddate.com/worldclock/meetingdetails.html?year=2020&month=1&day=24&hour=22&min=0&sec=0&p1=1229&p2=136&p3=179&p4=234&p5=22&p6=33&p7=121) in relevant places around the world while being in US/Pacific business hours so the Seattle team can respond.

## Limitations

If our Redis instance reaches its maximum memory limit, existing keys will be evicted using the [`volatile-ttl` policy](https://devcenter.heroku.com/articles/heroku-redis#maxmemory-policy) to make space for new keys.
This should preserve the most active logged in sessions and avoid throwing errors if we hit the limit.
If we regularly start hitting the memory limit, we should bump up to the next add-on plan, but I don't expect this to happen anytime soon with current usage.
