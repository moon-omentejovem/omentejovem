# =========================================
# Custom VPC omentejovem
# =========================================

resource "aws_internet_gateway" "omj" {
  vpc_id = aws_vpc.omj.id

  tags = {
    "Name" = "omentejovem-igw"
  }
}

resource "aws_vpc" "omj" {
  cidr_block = "172.33.0.0/16"

  tags = {
    Name = "omentejovem-network"
  }
}

resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.omj.id
  cidr_block              = cidrsubnet("172.33.0.0/16", 8, 0)
  availability_zone       = "${var.region}a"
  map_public_ip_on_launch = false
}
