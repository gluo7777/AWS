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
- allocate elastic ip from amazon's pool
- repeat and assign to each ec2 instance
- modify pem file permissions: `chmod 400 <pem-file>`
- test ssh connection `ssh -i <pem file> ec2-user@<public-ip>`
- update packages `sudo yum update`
- update repositories 
	- `sudo su`
	- `curl -sL https://rpm.nodesource.com/setup_12.x | bash -`

### Start app
- install node
- copy source code to instance `scp -r -i <pem file> ./pizza-luvrs ec2-user@<public-ip>:/home/ec2-user/pizza-luvrs`
- `npm install`
- `npm start`
- navigate to `<public-ip>:3000` in browser

### Scaling instance
- create image from current instance
- create load balancer to maintain a consistent DNS entry and balances requests to multiple instances
	- select both availability zones
	- change target group port to 3000
	- set up sticky session via target groups (1 day)
- create auto scaling group to control instance pools
	- launch auto scaling group wizard
	- start with creating launch configuration
	- populate launch configuration details with user script to start node application
	```bash
	#!/bin/bash
	echo "Starting pizza-luvrs web application"
	cd /home/ec2-user/pizza-luvrs
	npm start
	```
	- select pizza-ec2-sg
	- start auto scaling group configuration
	- select vpc and add both subnets
	- attach target group to auto scaling group via advanced details
	- verify 2 instances successfully started
	- remove 3rd instance if it's somehow still attached
- open load balancer dns name url in browser
- summary: load balancer > auto scaling group > pool > instance

### Enhance security
- modify ec2 group
	- keep ssh access if you need to do more set up
	- delete ipv6 rule
	- modify inbound tcp to only allow requests from load balancer (type `s` to auto-complete with resource name of LB)
		- using name b/c LB IP can dynamically change

### Add auto scaling rules
- create simple scaling policy for scaling up
	- create alarm using network out
		- try something above baseline (for easy testing use 10KB)
		- change action to add 1
- create simple scaling policy for scaling **down**
	- change action to remove 1
- change maximum instances to 4

### Test auto scaling
- Use JMeter/Apache Benchmark
- wait 5 minutes then check activity history to confirm that new instances are created
- wait another 5 minutes to check that instances have scaled back down to 2

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

## S3

- can target specific region for storage
- Bucket
	- unique name
	- Object
		- File
		- Metadata
		- Key: path/filename
	- Control access with bucket policies and/or IAM ACL
- URL: `<bucket>.s3.<region>.amazonaws.com/<path>`
- cross region replication can reduce latenacy and increase redundancy (2 regions)
	- CloudFront is better suited when more than 2 regions
- Use AWS Policy Generator to create a bucket policy

## Setting up S3

- launch s3 create bucket configuration
- wizard will show buckets in all regions
- For testing, unblock public access
- Go to [AWS Policy Generator](https://awspolicygen.s3.amazonaws.com/policygen.html)
- Select s3 bucket policy
- Allow * | Action GetObject (allows downloading image/view files in browser)
- create ARN with `<bucket-name>/*` suffix so policy applies to all files in bucket
- paste generated json in permission/bucket policy

## Upload to S3

- upload static resources (images, css) to S3
- CLI: `aws s3 cp <local folder> s3://<bucket>/<remote folder> --recursive --exclude <pattern>`
- upload assets/js to js | exclude .DS_Store
- upload assets/css to css | exclude .DS_Store
- upload assets/pizzas to pizzas | exclude .DS_Store
- verify all 3 folders uploaded
- test bucket policy by opening the resources directly in browser
- upload toppings via file upload wizard
- upload assets/*.png via file upload wizard
- change root assets url references `/assets` to `<bucket url>` in project hbs files. leave out protocol
- make same change in js files
- re-upload js files
- make same change in mock_pizzas folder
- create image store js file for S3 at `lib/imageStoreS3.js`
- modify `lib/imageStore.js` to use `imageStoreS3`

## Configure S3 Bucket for CORS
- Allow GET for all origins with max age of 3K seconds
```xml
<CORSConfiguration>
	<CORSRule>
		<AllowedOrigin>*</AllowedOrigin>
		<AllowedMethod>GET</AllowedMethod>
		<MaxAgeSeconds>3000</MaxAgeSeconds>
	</CORSRule>
</CORSConfiguration>
```
- run application locally to test CORS access

## Accessing S3 within EC2 instance

- use scp to reupload project to EC2. 
	- make sure to exclude node_modules
	- `rm -rf node_modules && scp -r -i <pem-file> <folder> ec2-user@<ec2-pub-ip>:/home/ec2-user`
	- node_modules will not be overwritten in ec2 instance so no need to run npm install again
- create new image from existing instance `pizza-s3-image`
- Create new IAM role `pizza-s3-role`
	- EC2
	- allow access to S3 `AmazonS3FullAccess`
- Create new EC2 launch configuration `pizza-s3-launch`
	- add new role
	- select assign pub ip to every instance
	- add start script from last launch configuration
		- **DON'T FORGET SHEBANG**
			- if you get a 502 bad gate way, double check user script
	- add pizza-ec2-sg security group
	- select existing key pair
- Modify auto scaling group to use new launch configuration
	- terminate existing existances
	- verify that new instances are created under new lanuch configuration
	- verify ec2 url and login to create new pizza

## Setting up RDS

- creates EC2 instance under the cover
	- OS
	- DB engine (e.g. PostgresSQL)
- RDS Backups
	- default: occurs daily
	- Backups can be stored 1 - 35 days
- Multi-AZ Deployment
	- replicates DB in different availability zone
	- automatic failover
- Database Read Replica
	- Non-production copy of database
	- eventual consistency with source (won't impact production data)
	- useful for running queries
	- not a target for automatic failover
- How to choose DB engine
	- licensing cost
	- familiarity
	- quality of client software

### Provision RDS with PSQL

- RDS > create database `pizza-db-instance-a`
	- PostgreSQL `11.5-R1`
	- free tier template
	- create and store master credentials
	- db.t2.micro
	- add to VPC `pizza-vpc`
	- temporarily allow public access
	- temporarily keep default VPC security group
	- enable initial DB creation
		- db name: `pizza_db_a_0`

### Connect to RDS instance

- Add inbound rule in RDS VPC
	- `PostgreSQL - TCP - 5432 - My IP - <Your IP Address>`
- Download client like pgAdmin or just install Postgres and use psql
	- `psql -h <rds-endpoint> -d pizza_db_a_0 -U <db-username>`
	- Hostname = endpoint
- create `pizzas` table
	- `psql -h $PSQL_HOST -d pizza_db_a_0 -U $PSQL_USER -f ./create_pizzas_table.sql`

## Setting up DynamoDB

- completely abstracts hardware and utilizes document structure