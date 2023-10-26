/* In production, share the cookie across nextstrain.org and all subdomains so
 * sessions are portable (as long as the session store and secret are also
 * shared by the deployments).  Otherwise, set a host-only cookie.
 *
 * Note that this also means the cookie will be sent to third-party services we
 * host on subdomains, like docs.nextstrain.org, support.nextstrain.org, and
 * others.  Although we do "trust" these providers, I still have some
 * reservations about it as it does increase the surface area for potential
 * session hijacking via cookie theft.  The big mitigation for me is that this
 * cookie is already HTTP-only, so JS injections on those providers (which are
 * much much more likely than server-side injections) can't access the cookie.
 * The comprehensive, longer term solution (that everyone serious about
 * security does for essentially this same reason) is to move our internal
 * services off the user-facing domain (e.g. support.nextstrain-team.org)
 * and/or accomplish session portability another way (e.g. explicit SSO by
 * next.nextstrain.org against nextstrain.org as an IdP instead of implicit SSO
 * via session sharing).
 *   -trs, 18 March 2022
 */
output "SESSION_COOKIE_DOMAIN" {
  value = "nextstrain.org"
}
