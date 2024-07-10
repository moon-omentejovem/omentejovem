
# Get ECR pwd
aws ecr get-login-password --region sa-east-1 | docker login --username AWS --password-stdin 732075124266.dkr.ecr.sa-east-1.amazonaws.com

docker build -f Admin.Dockerfile -t omentejovem-admin .

docker tag omentejovem-admin:latest 732075124266.dkr.ecr.sa-east-1.amazonaws.com/omentejovem-admin:latest

docker push 732075124266.dkr.ecr.sa-east-1.amazonaws.com/omentejovem-admin:latest