locals {
  user_attributes = flatten([
    "address",
    "birthdate",
    var.env == "production" ? ["custom:allowed_sources"] : [],
    "email",
    "email_verified",
    "family_name",
    "gender",
    "given_name",
    "locale",
    "middle_name",
    "name",
    "nickname",
    "phone_number",
    "phone_number_verified",
    "picture",
    "preferred_username",
    "profile",
    "updated_at",
    "website",
    "zoneinfo",
  ])
}


resource "aws_cognito_user_pool_client" "nextstrain_dot_org" {
  lifecycle {
    prevent_destroy = true
  }

  user_pool_id = aws_cognito_user_pool.nextstrain_dot_org.id

  name = "nextstrain.org"

  # Allow client to use OAuth (with the authorization code grant type only)
  # against the user pool, plus use refresh tokens (required).
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "phone", "profile"]

  supported_identity_providers = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # Token lifetimes dictate background refresh rates for nextstrain.org sessions.
  id_token_validity      = var.env == "production" ? 60 : 5
  access_token_validity  = var.env == "production" ? 60 : 5
  refresh_token_validity = var.env == "production" ? 365 : 60
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = var.env == "production" ? "days" : "minutes"
  }

  # Allowed return destinations after login
  callback_urls = [for origin in var.origins : "${origin}/logged-in"]

  # Allowed return destinations after logout
  logout_urls = var.origins

  read_attributes  = local.user_attributes
  write_attributes = setsubtract(local.user_attributes, ["email_verified", "phone_number_verified"])
}

moved {
  from = aws_cognito_user_pool_client.nextstrain_dot_org_prod
  to   = aws_cognito_user_pool_client.nextstrain_dot_org
}


resource "aws_cognito_user_pool_client" "nextstrain-cli" {
  lifecycle {
    prevent_destroy = true
  }

  user_pool_id = aws_cognito_user_pool.nextstrain_dot_org.id

  name = "nextstrain-cli"

  # Allow client to use OAuth (with the authorization code grant type only)
  # against the user pool, plus Secure Remote Password (SRP) auth and refresh
  # token auth (required).
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "phone", "profile"]

  supported_identity_providers = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # Token lifetimes dictate background refresh (and re-login) rates for the CLI.
  id_token_validity      = 60
  access_token_validity  = 60
  refresh_token_validity = 90
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  # Allowed redirection destinations to complete authentication.
  #
  # We'd prefer to use 127.0.0.1 instead of localhost to avoid name resolution
  # issues on end user systems, issues which are known to occur.  The "OAuth
  # 2.0 for native apps" best current practice (RFC 8252) suggests as much¹, but
  # alas, Cognito's https-requirement exception for localhost is not applied to
  # 127.0.0.1.
  #
  # Similarly, we'd prefer to register without an explicit port and rely on the
  # same RFC's stipulation of relaxed port matching for localhost², but alack,
  # Cognito doesn't follow that either and requires strict port matching.
  #
  # Since the CLI may not always be able to listen on a specific port given
  # other services that might be running, and there's also value in random
  # choice making interception harder, register a slew of ports for use and let
  # Nextstrain CLI draw from the list.
  #  -trs, 19 Nov 2023
  #
  # ¹ <https://datatracker.ietf.org/doc/html/rfc8252#section-8.3>
  # ² <https://datatracker.ietf.org/doc/html/rfc8252#section-7.3>
  callback_urls = formatlist("http://localhost:%d/", random_integer.nextstrain_cli_callback_port[*].result)

  read_attributes  = local.user_attributes
  write_attributes = setsubtract(local.user_attributes, ["email_verified", "phone_number_verified"])
}

resource "random_integer" "nextstrain_cli_callback_port" {
  # AWS Cognito supports 100 callback URLs per client
  # <https://docs.aws.amazon.com/cognito/latest/developerguide/limits.html#resource-quotas>
  count = 99

  # IANA-defined port range for dynamic use.
  # <https://datatracker.ietf.org/doc/html/rfc6335#section-6>
  min = 49152
  max = 65535
}
