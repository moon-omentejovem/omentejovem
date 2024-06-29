
# Get ECR pwd
aws ecr get-login-password --region sa-east-1 | docker login --username AWS --password-stdin 732075124266.dkr.ecr.sa-east-1.amazonaws.com

docker build -f DbSeeder.Dockerfile -t omentejovem-db-seeder .

docker tag omentejovem-db-seeder:latest 732075124266.dkr.ecr.sa-east-1.amazonaws.com/omentejovem-db-seeder:latest

docker push 732075124266.dkr.ecr.sa-east-1.amazonaws.com/omentejovem-db-seeder:latest