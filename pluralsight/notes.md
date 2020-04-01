# AWS Development

## Developing in the cloud

Industry shifting from on premise to cloud.

### Similarities

- application requires sae OS and platform
- conceptual functionalities remain - http, db connections

### Differences

- extracting responsibility of application into services
- 1 service = 1 responsibility
    - files
    - caching
- application will handle core business logic

## Web of AWS

- 55+ services that can work independently/interactively
- communicate via TCP connection
- each service has local IP and can be assigned external IP
- some services can also be referenced by resource names
- EC2 forms basis of most extended services: RDS, EB, etc.

## Tooling

- Web Console
- CLI
- SDK

## Set Up

1. Install AWS CLI: https://awscli.amazonaws.com/AWSCLIV2.msi

2. Test installation

```bash
aws --version
# aws-cli/2.0.6 Python/3.7.5 Windows/10 botocore/2.0.0dev10
```

3. Configure AWS Access
    - https://console.aws.amazon.com/iam/home?region=us-east-2#/security_credentials
    - Access Keys

## Pizza Project

EC2 - run application
DynamoDB - stores users
RDS - stores pizzas
Elastic Cache - cache layer to save memory
S3 - stores images