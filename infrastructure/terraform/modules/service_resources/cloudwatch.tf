resource "aws_cloudwatch_log_group" "ecs_log_group" {
  name = "ecs-omentejovem"
}

resource "aws_cloudwatch_log_stream" "ecs_log_group_stream" {
  name           = "awslogs-omentejovem-api"
  log_group_name = aws_cloudwatch_log_group.ecs_log_group.name
}