# =========================================
# EC2 Security Group
# =========================================

resource "aws_security_group" "ec2_sg" {
  name        = "ec2-ssh-access"
  description = "Allow SSH access to EC2"
  vpc_id      = aws_vpc.omj.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_security_group" "ec2_sg_all_inbound" {
  name        = "ec2-all-inbound"
  description = "Allow all inbound traffic to EC2"
  vpc_id      = aws_vpc.omj.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
