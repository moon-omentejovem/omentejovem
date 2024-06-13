resource "aws_ecs_cluster" "omentejovem" {
  name        = "omentejovem"
  setting {
    name = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_service" "api" {
  name = "api"
  cluster = aws_ecs_cluster.omentejovem.id
  task_definition = aws_ecs_task_definition.api_task_definition.arn
  desired_count = 1
  depends_on = [ aws_iam_role.ecs_role ]

  network_configuration {
    security_groups = [ 
      aws_security_group.api_sg.id
    ]
    subnets = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id
    ]
  }
}

resource "aws_ecs_task_definition" "api_task_definition" {
  family = "service"
  network_mode = "awsvpc"
  requires_compatibilities = [ "FARGATE" ]
  cpu = 1024
  memory = 2048
  execution_role_arn = "arn:aws:iam::732075124266:role/ecsTaskExecutionRole"
  container_definitions = jsonencode([
    {
      name = "omentejovem-api",
      image = var.api_image,
      portMappings = [
        {
          name = "omentejovem-api-80-tcp",
          containerPort = 80,
          hostPort = 80,
          protocol = "tcp",
          appProtocol = "http"
        },
        {
          name = "omentejovem-api-443-tcp",
          containerPort = 443,
          hostPort = 443,
          protocol = "tcp",
          appProtocol = "http"
        }
      ],
      essential = true,
      environment = [
        {
          name = "MongoDb__ConnectionString",
          value = "mongodb://${var.db_username}:${module.database_mongodb_password.secret_value}@${aws_docdb_cluster.omentejovem_db.endpoint}:27017/"
        },
        {
          name = "MongoDb__DatabaseName",
          value = "${var.db_name}"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          "awslogs-create-group": "true",
          "awslogs-group": "ecs-omentejovem",
          "awslogs-region": "sa-east-1",
          "awslogs-stream-prefix": "awslogs-omentejovem-api"
        }
      }
    }
  ])
  depends_on = [ aws_cloudwatch_log_group.ecs_log_group ]
}

resource "aws_ecs_cluster_capacity_providers" "example" {
  cluster_name = aws_ecs_cluster.omentejovem.name

  capacity_providers = ["FARGATE"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}