resource "aws_docdb_cluster" "omentejovem_db" {
  cluster_identifier  = var.db_name
  master_username     = var.db_username
  master_password     = module.database_mongodb_password.secret_value
  skip_final_snapshot = true
  vpc_security_group_ids = [ 
    aws_security_group.db_sg.id
  ]
  db_subnet_group_name = aws_docdb_subnet_group.omentejovem_db_subnet_group.name

  depends_on = [ aws_docdb_subnet_group.omentejovem_db_subnet_group ]
}

resource "aws_docdb_subnet_group" "omentejovem_db_subnet_group" {
  name       = "docdbsubnetgroup"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_docdb_cluster_instance" "omentejovem_db_instance" {
  count                = 3
  identifier_prefix    = "omentejovem-db-instance"
  cluster_identifier   = aws_docdb_cluster.omentejovem_db.cluster_identifier
  instance_class       = "db.t3.medium"
  
}