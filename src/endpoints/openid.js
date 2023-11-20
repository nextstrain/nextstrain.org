/**
 * OpenID Connect 1.0 endpoints.
 *
 * @module endpoints.openid
 */

import {
  EFFECTIVE_OIDC_CONFIGURATION,
  OAUTH2_CLI_CLIENT_ID,
  OAUTH2_CLI_CLIENT_REDIRECT_URIS,
  OIDC_USERNAME_CLAIM,
  OIDC_GROUPS_CLAIM,
  COGNITO_USER_POOL_ID,
} from "../config.js";


/**
 * A client configuration document for Nextstrain CLI to automatically discover
 * the client metadata it should use for itself.
 *
 * Based on the OIDC dynamic client registration spec, see
 * {@link https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata} and
 * {@link https://openid.net/specs/openid-connect-registration-1_0.html#ReadResponse}.
 */
const cliClientConfiguration = {
  client_id: OAUTH2_CLI_CLIENT_ID,

  // Static/assumed values asserted by the CLI, but informative to include.
  application_type: "native",
  response_types: ["code"],
  grant_types: ["authorization_code"],

  /* Used to know the list of ports that can be listened to on localhost, as
   * not all IdPs follow RFC 8252 § 7.3.¹
   *
   * ¹ <https://datatracker.ietf.org/doc/html/rfc8252#section-7.3.>
   */
  redirect_uris: OAUTH2_CLI_CLIENT_REDIRECT_URIS,

  /********************************************
   * Custom metadata fields below this point. *
   ********************************************/

  /* Used by the CLI for display purposes only, but nice to get the display
   * right.
   */
  id_token_username_claim: OIDC_USERNAME_CLAIM,
  id_token_groups_claim: OIDC_GROUPS_CLAIM,

  /* Used for Secure Remote Password auth flow with Cognito outside the
   * OIDC/OAuth2 protocols.
   */
  aws_cognito_user_pool_id: COGNITO_USER_POOL_ID,
};


/**
 * IdP metadata for the /.well-known/openid-configuration endpoint.
 *
 * As the spec allows, we extend the metadata with a client configuration
 * section for Nextstrain CLI to allow it to perform automatic discovery.
 *
 * Refer to {@link https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata}.
 */
export const providerConfiguration = (req, res) => res.json({
  ...EFFECTIVE_OIDC_CONFIGURATION,
  nextstrain_cli_client_configuration: cliClientConfiguration,
});
