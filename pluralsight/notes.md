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

Create access keys: https://console.aws.amazon.com/iam/home?region=us-east-2#/security_credentials

```bash
$ aws configure
AWS Access Key ID [None]: <>
AWS Secret Access Key [None]: <>
Default region name [None]: us-east-2
Default output format [None]: json

$ aws ec2 describe-instances
{
    "Reservations": []
}
```

## Set up cloud administration

1. set up alarms with (CloudWatch)
    - go to sns dashboard
    - switch to us-east-1 (billing alerts only available here)
    - check `Receive PDF Invoice By Email` and `Receive Billing Alerts` in billing pref
    - > cloud watch

2. configuring and managing users (IAM)
    - create non-root user
    - use aws cli to re-configure credentials
    - delete root access key
    - create admin group
    - create password policy
    - set up sign in credentials for user
    - login as IAM user: https://<>.signin.aws.amazon.com/console
    
## Pizza Project

### Services

EC2 - run application
DynamoDB - stores users
RDS - stores pizzas
Elastic Cache - cache layer to save memory
S3 - stores images

### Set Up

- Create VPC
- create 2 subnets against different availability zones
- for 2nd subnet, set non-conflicting CIDR (e.g. 10.0.0.0/24 vs 10.0.1.0/24)
- add 0.0.0.0/0 route rules for both subnets
- Create EC2 instance
- add VPC
- add SG with custom TCP with port 3000 from anywhere
- ceate ssh key pair

### Deployment

## EC2
- compute vs storage optimized
- EBS volumes exists independently from EC2 instances

## VPC

### Security Groups
- shared among instances
- EC2 instances can give access to security groups instead of individual EC2 instances

### Routing Table
- route traffic between VPC and external

### Network ACL
- each VPC has 1 list
- applies network access to entire VPC
- different from sec groups in that NACL uses network rules instead of policies

### Subnet
- isolated subzone within a VPC
- allows for granular access control within VPC

## Monitoring

### Cloud Watch

- examples: throughput, billing
- service > CW > SNS (SMS,Email,HTTP) | Action Trigger

### SNS Topic

- unique resource name which acts as a gateway for routing notifications to SMS/Email

## Security

### IAM Policies

- collection of permissions
- assign access to groups
- add users to group
- can be aws (service-wide) or customer managed 

<Action> <Allow|Deny> <Resource|*>