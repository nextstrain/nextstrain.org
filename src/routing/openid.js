import * as endpoints from '../endpoints/index.js';


export function setup(app) {
  /* OpenID Connect 1.0 configuration.  Retrieved by Nextstrain CLI to
   * discovery necessary authentication details.
   *
   * <https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata>
   */
  app.routeAsync("/.well-known/openid-configuration")
    .getAsync(endpoints.openid.providerConfiguration);
}
