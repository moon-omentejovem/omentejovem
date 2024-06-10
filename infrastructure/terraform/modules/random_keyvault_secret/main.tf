
resource "random_password" "this" {
  length           = 32
  special          = true
  override_special = "!@#$%&*()-_=+[]<>:?"

  lifecycle {
    ignore_changes = [
      override_special,
      length,
    ]
  }
}

resource "aws_secretsmanager_secret_version" "this" {
  secret_id    = var.secret_id
  secret_string = random_password.this.result
}