# nextstrain.org — Hosting & DDoS Resilience Brief

_Status: draft for discussion · 2026-09-28_

**TL;DR:** Solve the floods with a **Cloudflare edge + moving dataset delivery off the dynos** — both platform-agnostic and incremental. **Don't migrate off Heroku** as a reaction to this; make that a separate, unhurried decision.

## Problem

Recurring application-layer floods (rotating datacenter IPs, `POST /<token>/Tun` fingerprint) took the site down via Heroku **H11 "backlog too deep."** The root cause isn't the flood's size — it's that dynos do **synchronous S3 dataset proxy + gzip on a single-threaded event loop** (legit requests up to 90s), so trivial floods pile up _behind_ blocked event loops. **This fragility follows the app to any host.**

## Shipped (stabilized)

App-level IP blocklist + `/Tun`/`<uuid>` pattern block + per-IP rate limiter (PRs #1381, #1383). These stop abuse reaching app logic but **don't shed router/dyno load** — a stopgap, not the fix.

## Recommendation — layered, Cloudflare-centric

Use Cloudflare (we have it; bigger network + better WAF/caching than Heroku's Expedited WAF).

| Phase | Work | Effort | Impact |
|---|---|---|---|
| **1** | Cloudflare proxied: WAF + rate-limit + **managed challenge** + static cache | Days | **Ends the floods** — the JS challenge defeats headless bots regardless of IP |
| **2** | Lock origin to Cloudflare (secret header verified in-app) | Hours | Closes the `*.herokuapp.com` bypass |
| **3** | Edge-cache **public** datasets (⚠️ never cache Cognito/private-group content) | ~1 wk | Big origin offload |
| **4** | Serve datasets from **S3/CDN, not through dynos** | 2–4 wks | Removes the root fragility |

Keep the app-level blocks as defense-in-depth.

## Migrate off Heroku? Not now.

- The pain isn't Heroku-specific — migrating fixes none of the root causes and adds risk.
- Managed PaaS suits our ops capacity; the canary→promote pipeline, Cognito, Redis, and Terraform all work.
- The modernization that _matters_ is **architectural** (edge + static/data offload + thin API) and is doable **incrementally on Heroku**.
- If revisited later on its own merits: **AWS-native** (App Runner / ECS Fargate + CloudFront + WAF — consolidates with our S3 + Cognito) or a modern PaaS (Cloud Run / Render / Fly). Phase 4 makes any future migration a non-event.

## Next step

Stand up **Phase 1** (Cloudflare WAF + rate-limit + challenge rules) and **Phase 2** (origin-lock middleware).
