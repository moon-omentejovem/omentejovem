variable "api_image" {
  type = string
  description = "The ECR Image for API"
  default = "omentejovem-api:c76061c"
}

variable "db_username" {
  type = string
  description = "username for master db"
  default = "omentejovem_admin"
}

variable "db_name" {
  type = string
  description = "The DB master name"
  default = "omentejovem-db"
}