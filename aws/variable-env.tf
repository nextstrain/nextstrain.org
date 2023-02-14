variable "env" {
  type        = string
  description = "Name of the environment described by this Terraform configuration"

  validation {
    # We might want to loosen this later if we find ourselves spinning up
    # additional environments more than infrequently.  If so, note that the
    # value is used in a few names, ids, and other places that often have
    # character restrictions, so it'd be prudent to restrict the valid
    # character set (and length) here.
    #   -trs, 6 Feb 2024
    condition     = contains(["production", "testing"], var.env)
    error_message = "env must be 'production' or 'testing'"
  }
}
