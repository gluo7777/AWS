# Summaries

## Why AWS

AWS started in 2001 with a small number of services. As of today, it is the #1 cloud provider. The main advantages of deploying to the cloud: 1) eliminate hardware overhead and costs, 2) provider handles fundamentals such as security, autoscaling, and virtualization while customer can focus on building business logic. Advantages of using AWS compared to other providers, such as MS Azure, Google Cloud, and Heroku is the breadth of services offered by AWS, reliability, global footprint, and tooling (CLI, SDK, Web Console). In terms of cost, AWS uses a pay-for-what-you-use model so that there are no start up costs and it is easy to scale your application with the number of consumers.

## AWS Services

- Services offered by AWS can be broken down into core services and extended services. 
- It is common for extended services to utilize core services under the hood. 
- Core Services
    - Elastic Compute (EC2): A virtual machine instance configured with a machine image (AMI). This is the basic building block of many extended services.
    - Relational Data Services (RDS)
    - Simple Storage Service (S3): For storing static resources.
    - Route53: Domain name system
- Extended Services: Elastic Beanstalk, Lambda, VPC, IAM, DynamoDB, and more

## Security

The platform offers a security system with very fine grain access controls. Groups are logical units in which policies can be applied and users can be added. Policy lists define all actions that can be taken by users in a group. 

## From new AWS account to first deployment

- Use AWS CLI to configure local work space for the first time.
- Set up an alarm (CloudWatch) in us-east-1 to receive alerts for billing charges.
- Follow AWS best practices for configuring and managing users.
- Set up a VPC with multiple subnets, each potentially have different availability zones and network policies (i.e. private and public subnets)
- Create an EC2 security group and add that to the VPC. 
- Create a new EC2 instance and add to EC2 security group.
- SSH into EC2 instance to perform a one time intial set up of application dependencies and run time environment.
- Save EC2 instance launch configuration and extract AMI from it.
- Create a load balancer target group that targets the VPC and its subnets. Enable sticky session so that requests part of the same session targets the same instance.
- Create an auto scaling group. Add a launch configuration to start the application when a new instance is spun up. Attach load balancer target group so load balancer will route requests to instances managed by auto scaler.
- At this point, remove any unnecessary access and ensure that only the EC2 instances will only accept requests from the load balancer.
- Configure at least 2 auto scaling rules to scale up and scale down an application. Increase the number of maximum instances.
- Run a load test to verify auto scaling.

## S3

- S3 is a service that can be used to host any kind of static resource in the cloud. It offers practically unlimited storage capacity.
- S3 is organized into buckets which is composed of objects (files).
- Access can be controlled with bucket policies and/or IAM roles. 
- Bucket objects can be accessed over HTTP by exposing the bucket's public IP. They also be accessed by other services in the same VPC via ARN or IP.
- S3 is not suited for multi-region hosting compared to CloudFront as bucket replication is limited to 2 regions.
- EC2 instances can be granted an IAM role that allows full access to bucket objects.