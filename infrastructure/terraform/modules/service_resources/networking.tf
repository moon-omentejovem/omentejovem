resource "aws_vpc" "default_vpc" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.default_vpc.id
  depends_on = [ aws_vpc.default_vpc ]

  tags = {
    Name = "Internet"
  }

  lifecycle {
    ignore_changes = [ tags ]
  }
}

# resource "aws_internet_gateway_attachment" "internet_gateway_attachment" {
#   internet_gateway_id = aws_internet_gateway.internet_gateway.id
#   vpc_id = aws_vpc.default_vpc.id
#   depends_on = [ aws_internet_gateway.internet_gateway, aws_vpc.default_vpc ]
#   lifecycle {
#     replace_triggered_by = [ aws_internet_gateway.internet_gateway ]
#   }
# }

resource "aws_subnet" "public_1" {
  vpc_id            = aws_vpc.default_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "sa-east-1a" # Change as needed
  map_public_ip_on_launch = true
  tags = {
    Name = "public-subnet-1"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id            = aws_vpc.default_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "sa-east-1b" # Change as needed
  map_public_ip_on_launch = true
  tags = {
    Name = "public-subnet-2"
  }
}

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.default_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "sa-east-1a" # Change as needed
  tags = {
    Name = "private-subnet-1"
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.default_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "sa-east-1b" # Change as needed
  tags = {
    Name = "private-subnet-2"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.default_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }
  tags = {
    Name = "public-route-table"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.default_vpc.id
  tags = {
    Name = "private-route-table"
  }
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}

resource "aws_security_group" "frontend_sg" {
  vpc_id = aws_vpc.default_vpc.id
  name   = "frontend-sg"
  tags = {
    Name = "frontend-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "frontend_http" {
  security_group_id = aws_security_group.frontend_sg.id
  from_port         = 80
  to_port           = 80
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "frontend_https" {
  security_group_id = aws_security_group.frontend_sg.id
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "frontend_all" {
  security_group_id = aws_security_group.frontend_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_security_group" "api_sg" {
  vpc_id = aws_vpc.default_vpc.id
  name   = "api-sg"
  tags = {
    Name = "api-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "api_http" {
  security_group_id = aws_security_group.api_sg.id
  from_port         = 80
  to_port           = 80
  referenced_security_group_id = aws_security_group.frontend_sg.id
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "api_https" {
  security_group_id = aws_security_group.api_sg.id
  from_port         = 443
  to_port           = 443
  referenced_security_group_id = aws_security_group.frontend_sg.id
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "api_all" {
  security_group_id = aws_security_group.api_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_security_group" "admin_sg" {
  vpc_id = aws_vpc.default_vpc.id
  name   = "admin-sg"
  tags = {
    Name = "admin-sg"
  }
}

# resource "aws_vpc_security_group_ingress_rule" "admin_http" {
#   security_group_id = aws_security_group.admin_sg.id
#   from_port         = 80
#   to_port           = 80
#   cidr_ipv4         = "x.x.x.x/32" # Replace with actual IPs
#   ip_protocol       = "tcp"
# }

# resource "aws_vpc_security_group_ingress_rule" "admin_https" {
#   security_group_id = aws_security_group.admin_sg.id
#   from_port         = 443
#   to_port           = 443
#   cidr_ipv4         = "x.x.x.x/32" # Replace with actual IPs
#   ip_protocol       = "tcp"
# }

# resource "aws_vpc_security_group_egress_rule" "admin_all" {
#   security_group_id = aws_security_group.admin_sg.id
#   from_port         = 0
#   to_port           = 0
#   cidr_ipv4         = "0.0.0.0/0"
#   cidr_ipv6         = "::/0"
#   ip_protocol       = "-1"
# }

resource "aws_security_group" "db_sg" {
  vpc_id = aws_vpc.default_vpc.id
  name   = "db-sg"
  tags = {
    Name = "db-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "db_api" {
  security_group_id = aws_security_group.db_sg.id
  from_port         = 5432
  to_port           = 5432
  referenced_security_group_id = aws_security_group.api_sg.id
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "db_admin" {
  security_group_id = aws_security_group.db_sg.id
  from_port         = 5432
  to_port           = 5432
  referenced_security_group_id = aws_security_group.admin_sg.id
  ip_protocol       = "tcp"
}

# resource "aws_vpc_security_group_ingress_rule" "db_additional" {
#   security_group_id = aws_security_group.db_sg.id
#   from_port         = 5432
#   to_port           = 5432
#   cidr_ipv4         = "z.z.z.z/32" # Replace with actual IPs if needed
#   ip_protocol       = "tcp"
# }

resource "aws_vpc_security_group_egress_rule" "db_all" {
  security_group_id = aws_security_group.db_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}