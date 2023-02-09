output "COGNITO_USER_POOL_ID" {
  value = aws_cognito_user_pool.nextstrain_dot_org.id
}

output "COGNITO_BASE_URL" {
  value = format("https://%s", coalesce(
    one(aws_cognito_user_pool_domain.custom[*].domain),
    "${aws_cognito_user_pool_domain.cognito.domain}.auth.${split("_", aws_cognito_user_pool.nextstrain_dot_org.id)[0]}.amazoncognito.com",
  ))
}

output "COGNITO_CLIENT_ID" {
  value = aws_cognito_user_pool_client.nextstrain_dot_org.id
}

output "COGNITO_CLI_CLIENT_ID" {
  value = aws_cognito_user_pool_client.nextstrain-cli.id
}
