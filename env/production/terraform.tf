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

    # Default workspace uses s3://nextstrain-terraform/nextstrain.org/production/tfstate
    bucket = "nextstrain-terraform"
    key    = "nextstrain.org/production/tfstate"

    # Non-default workspaces use s3://nextstrain-terraform/workspace/${name}/nextstrain.org/production/tfstate
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

  env = "production"
  origins = [
    "https://nextstrain.org",
    "https://next.nextstrain.org",
    "https://dev.nextstrain.org",
  ]
}

moved {
  from = module.aws.module.cognito
  to   = module.cognito
}

module "iam" {
  source = "../../aws/iam"
  providers = {
    aws = aws
  }

  env = "production"

  COGNITO_USER_POOL_ID = module.cognito.COGNITO_USER_POOL_ID
}

moved {
  from = module.aws.module.iam
  to   = module.iam
}
