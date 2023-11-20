# These outputs are shared by all Terraform configurations (production and
# testing environments) via symlinks.  They correspond to required environment
# variables for the nextstrain.org server.
data "aws_region" "current" {}

output "AWS_REGION" {
  value = data.aws_region.current.name
}

output "COGNITO_USER_POOL_ID" {
  value = module.cognito.COGNITO_USER_POOL_ID
}

output "OIDC_IDP_URL" {
  value = module.cognito.OIDC_IDP_URL
}

output "OAUTH2_CLIENT_ID" {
  value = module.cognito.OAUTH2_CLIENT_ID
}

output "OAUTH2_CLI_CLIENT_ID" {
  value = module.cognito.OAUTH2_CLI_CLIENT_ID
}

output "OAUTH2_CLI_CLIENT_REDIRECT_URIS" {
  value = module.cognito.OAUTH2_CLI_CLIENT_REDIRECT_URIS
}

output "OAUTH2_LOGOUT_URL" {
  value = module.cognito.OAUTH2_LOGOUT_URL
}

output "OIDC_USERNAME_CLAIM" {
  value = "cognito:username"
}

output "OIDC_GROUPS_CLAIM" {
  value = "cognito:groups"
}

output "GROUPS_DATA_FILE" {
  value = "groups.json"
}
