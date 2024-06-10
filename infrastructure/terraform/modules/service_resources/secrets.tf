resource "aws_secretsmanager_secret" "mongodb_credentials" {
  name         = "mongodb_pwd"
  force_overwrite_replica_secret = true
}

module "database_mongodb_password" {
  source = "../random_keyvault_secret"
  secret_id = aws_secretsmanager_secret.mongodb_credentials.id
}

