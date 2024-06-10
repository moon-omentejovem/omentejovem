output "secret_value" {
  sensitive = true
  value     = aws_secretsmanager_secret_version.this.secret_string
}