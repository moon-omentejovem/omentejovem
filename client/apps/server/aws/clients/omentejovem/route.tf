resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.omj.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.omj.id
  }
}

resource "aws_route_table_association" "public_subnet_a" {
  route_table_id = aws_route_table.public_rt.id
  subnet_id      = aws_subnet.public_subnet_a.id
}
