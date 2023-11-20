output "COGNITO_USER_POOL_ID" {
  value = aws_cognito_user_pool.nextstrain_dot_org.id
}

output "OIDC_IDP_URL" {
  value = format("https://%s", aws_cognito_user_pool.nextstrain_dot_org.endpoint)
}

output "OAUTH2_CLIENT_ID" {
  value = aws_cognito_user_pool_client.nextstrain_dot_org.id
}

output "OAUTH2_CLI_CLIENT_ID" {
  value = aws_cognito_user_pool_client.nextstrain-cli.id
}

output "OAUTH2_CLI_CLIENT_REDIRECT_URIS" {
  value = aws_cognito_user_pool_client.nextstrain-cli.callback_urls
}

output "OAUTH2_LOGOUT_URL" {
  value = format("https://%s/logout", coalesce(
    one(aws_cognito_user_pool_domain.custom[*].domain),
    "${aws_cognito_user_pool_domain.cognito.domain}.auth.${split("_", aws_cognito_user_pool.nextstrain_dot_org.id)[0]}.amazoncognito.com",
  ))
}
