terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "registry.terraform.io/hashicorp/aws"
      version = "~> 4.32"
    }
  }

  backend "s3" {
    region = "us-east-1"

    # Default workspace uses s3://nextstrain-terraform/testing/nextstrain.org/tfstate
    bucket = "nextstrain-terraform"
    key    = "testing/nextstrain.org/tfstate"

    # Non-default workspaces use s3://nextstrain-terraform/workspace/${name}/testing/nextstrain.org/tfstate
    workspace_key_prefix = "workspace"

    # Table has a LockID (string) partition/primary key
    dynamodb_table = "nextstrain-terraform-locks"
  }
}

provider "aws" {
  region = "us-east-1"
}

module "cognito" {
  source = "../../aws/cognito"
  providers = {
    aws = aws
  }

  env = "testing"
  origins = [
    "http://localhost:5000",
    "https://localhost:5000",
  ]
}

# Skip iam as it only applies to production (for now at least).
#   -trs, 6 Feb 2023
