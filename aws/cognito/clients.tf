locals {
  user_attributes = [
    "address",
    "birthdate",
    "custom:allowed_sources",
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
  ]
}


resource "aws_cognito_user_pool_client" "nextstrain_dot_org_prod" {
  lifecycle {
    prevent_destroy = true
  }

  user_pool_id = aws_cognito_user_pool.nextstrain_dot_org.id

  name = "nextstrain.org prod"

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
  id_token_validity      = 60
  access_token_validity  = 60
  refresh_token_validity = 365
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  # Allowed return destinations after login
  callback_urls = [
    "https://dev.nextstrain.org/logged-in",
    "https://next.nextstrain.org/logged-in",
    "https://nextstrain.org/logged-in",
  ]

  # Allowed return destinations after logout
  logout_urls = [
    "https://dev.nextstrain.org",
    "https://next.nextstrain.org",
    "https://nextstrain.org",
  ]

  read_attributes  = local.user_attributes
  write_attributes = setsubtract(local.user_attributes, ["email_verified", "phone_number_verified"])
}


resource "aws_cognito_user_pool_client" "nextstrain_dot_org_dev" {
  lifecycle {
    prevent_destroy = true
  }

  user_pool_id = aws_cognito_user_pool.nextstrain_dot_org.id

  name = "nextstrain.org dev"

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
  id_token_validity      = 5
  access_token_validity  = 5
  refresh_token_validity = 60
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "minutes"
  }

  # Allowed return destinations after login
  callback_urls = [
    "http://localhost:5000/logged-in",
    "https://localhost:5000/logged-in",
  ]

  # Allowed return destinations after logout
  logout_urls = [
    "http://localhost:5000",
    "https://localhost:5000",
  ]

  read_attributes  = setsubtract(local.user_attributes, ["custom:allowed_sources"])
  write_attributes = setsubtract(local.user_attributes, ["custom:allowed_sources", "email_verified", "phone_number_verified"])
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
