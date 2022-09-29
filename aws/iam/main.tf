terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "registry.terraform.io/hashicorp/aws"
      version = "~> 4.32"
    }
  }
}

resource "aws_iam_policy" "NextstrainDotOrgServerInstance" {
  lifecycle {
    prevent_destroy = true
  }

  name   = "NextstrainDotOrgServerInstance"
  policy = file("${path.module}/policy/NextstrainDotOrgServerInstance.json")
}

resource "aws_iam_policy" "NextstrainDotOrgServerInstanceDev" {
  lifecycle {
    prevent_destroy = true
  }

  name   = "NextstrainDotOrgServerInstanceDev"
  policy = file("${path.module}/policy/NextstrainDotOrgServerInstanceDev.json")

  description = "Mirrors the policy of NextstrainDotOrgServerInstance, however limited to public groups + the blab private group. For Heroku review app and development of the server, as it prevents inadvertent access to private datasets."
}

# XXX TODO: IAM user nextstrain.org with attached policy (and associated access keys?)
# XXX TODO: IAM user nextstrain.org.dev with attached policy (and associated access keys?)
