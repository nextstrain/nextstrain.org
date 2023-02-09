# These outputs are shared by all Terraform configurations (production and
# testing environments) via symlinks.  They correspond to required environment
# variables for the nextstrain.org server.

output "COGNITO_USER_POOL_ID" {
  value = module.cognito.COGNITO_USER_POOL_ID
}

output "COGNITO_BASE_URL" {
  value = module.cognito.COGNITO_BASE_URL
}

output "COGNITO_CLIENT_ID" {
  value = module.cognito.COGNITO_CLIENT_ID
}

output "COGNITO_CLI_CLIENT_ID" {
  value = module.cognito.COGNITO_CLI_CLIENT_ID
}
