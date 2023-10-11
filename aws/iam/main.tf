terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "registry.terraform.io/hashicorp/aws"
      version = "~> 4.32"
    }
  }
}

locals {
  # The "dev" policy is used for all non-production environments, i.e. the
  # "testing" environment.
  #
  # It allows reduced, read-only access to a subset of non-public production
  # resources for which there aren't non-production counterparts (e.g.
  # s3://nextstrain-data).

  server_policy_name = (
    var.env == "production"
    ? "NextstrainDotOrgServerInstance"
    : "NextstrainDotOrgServerInstance-${var.env}"
  )

  server_policy_description = (
    var.env == "production"
    ? null
    : "Mirrors the policy of NextstrainDotOrgServerInstance, however limited to public groups + the blab private group. For Heroku review app and development of the server, as it prevents inadvertent access to private datasets."
  )
}

resource "aws_iam_policy" "server" {
  lifecycle {
    prevent_destroy = true
  }

  name        = local.server_policy_name
  description = local.server_policy_description

  policy = templatefile(
    "${path.module}/policy/${local.server_policy_name}.tftpl.json", {
      COGNITO_USER_POOL_ID = var.COGNITO_USER_POOL_ID
    }
  )
}

moved {
  from = aws_iam_policy.NextstrainDotOrgServerInstance
  to   = aws_iam_policy.server
}

resource "aws_iam_user" "server" {
  name = (
    var.env == "production"
    ? "nextstrain.org"
    : "nextstrain.org-${var.env}"
  )
}

resource "aws_iam_user_policy_attachment" "server" {
  user       = aws_iam_user.server.name
  policy_arn = aws_iam_policy.server.arn
}

# XXX TODO: Access keys for IAM user?
