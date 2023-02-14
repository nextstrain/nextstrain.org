variable "origins" {
  type        = set(string)
  description = "HTTP(S) origins of the nextstrain.org instances using this configuration"

  validation {
    condition     = length(var.origins) > 1
    error_message = "origins must have at least one value"
  }
}
