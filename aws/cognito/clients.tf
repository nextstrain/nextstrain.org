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

  # Allow Secure Remote Password (SRP) auth, plus refresh token auth (required).
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # Token lifetimes dictate background refresh (and re-login) rates for the CLI.
  id_token_validity      = 60
  access_token_validity  = 60
  refresh_token_validity = 30
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  read_attributes  = local.user_attributes
  write_attributes = setsubtract(local.user_attributes, ["email_verified", "phone_number_verified"])
}
