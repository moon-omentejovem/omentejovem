# =========================================
# Wordpress EC2 for omentejovem
# =========================================

resource "aws_key_pair" "omentejovem_ec2" {
  key_name   = "omentejovem-ec2-key"
  public_key = file("keys/omentejovem-ec2-key.pub")
}

resource "aws_volume_attachment" "omentejovem_ebs_att" {
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.omentejovem_ec2_ebs.id
  instance_id = aws_instance.omentejovem_ec2.id
}

resource "aws_instance" "omentejovem_ec2" {
  ami                         = "ami-0efcece6bed30fd98"
  instance_type               = "t2.micro"
  key_name                    = aws_key_pair.omentejovem_ec2.key_name
  associate_public_ip_address = true

  security_groups = [
    aws_security_group.ec2_sg.id,
    aws_security_group.ec2_sg_all_inbound.id
  ]
  subnet_id = aws_subnet.public_subnet_a.id

  tags = {
    Name = "omentejovem-wordpress-instance"
  }
}

resource "aws_ebs_volume" "omentejovem_ec2_ebs" {
  availability_zone = "${var.region}a"
  size              = 10
  type              = "gp2"

  tags = {
    Name = "omentejovem-wordpress-instance-storage"
  }
}
