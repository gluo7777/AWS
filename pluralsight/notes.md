# AWS Development

## **IMPORTANT**

> Follow below at **ALL** times

- **TURN OFF** instances when not using
- **DELETE** CloudFormation stacks before creating new one
- Only work on **IAM USER**. **Avoid** using root aws account.
- Do **NOT** add credentials/secrets/IPs/etc to version control.

## PluralSight Tips

- If you want to replay a certain part of the course but don't remember which module or time stamp
	- Click on Transcript
	- CTRL+F > `<text-to-match-on>`
	- Click on matched text to open exact timestamp

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

## Set up ORM in application

- install node modules
- create env file for db connection info
- create a `pizzaStore.js` for interacting with DB
	- Sequelize
	- define schema
-modify data/pizzas.js to store image in db
	- convert array objects into JSON strings when inserting
	- reverse conversion when retrieving
- modify other functions to interact with DB
- test with localhost

## DynamoDB

- completely abstracts hardware and utilizes document structure
- structure
	- table
		- item
			- primary key
				- string, number, or binary
		- provisioned throughput capacity
			- 1 unit = 4 KB
			- throttling occurs when exceeding PTC

### Setting up DynamoDB

- create DDB tables with string PK and default settings
	- toppings
	- users

### Set up Application

- create dynamoStore
- configure AWS sdk
- create DDB client
- add async functions
	- putItem
	- getAllItems
		- run a scan ( random order, 1 MB max throughput per transaction)
	- getItem

## RDS vs NOSQL

- RDS: faster, structured, **structured** query language = strong query flexibility
- DynamoDB: storage flexibility, difficult to query field thats not PK or secondary index

## Add DB access for EC2 instances

- Enhance pizza-ec2-role
	- add AmazonRDSFullAccess
	- add AmazonDynamoDBFullAccess
- modify RDS security group to add pizza-ec2-sg
- modify default VPC to create new postgresql rule for pizza-ec2-sg
- re-upload files and create new launch configuration

## Automate autoscaling and deployment

- automated application deployment
- infrastructure as code

## Cloud Formation

- allows easy replication of AWS resources to create multiple stacks (e.g. development, production)
- JSON template 
	- configuration of resources
	- tracked in VC
- stack
	- unique name
	- created from template
	- can be updated/deleted
		- deleting stack removes all the resources in stack
- tooling
	- CloudFormation Designer (GUI)
		- create from scratch
		- import template
	- CloudFormer
		- create template from existing infrastructure

### Recreate existing pizza application infrastructure with CF

**Failed to perform due to errors while creating certain resources**

- `pizza-luvrs/cloudformation/pizza.template`
	- update AMI ID in launcher `ami-06651e8ab7eb163a6`
	- for simplicity, just use image without database changes
	- update region
	- update account id
- launch CF wizard
	- add template file
	- `pizza-stack`
- monitor stack events for completion
- locate created lb and verify dns
- recreate `pizza-stack`

### (Optional: switch to CloudFormer)

- Follow [instructions](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-cloudformer.html) to create cloudformer stack
- modify rds to use pizza-vpc
- modify pizza-vpc ACL to allow postgres connections from EC2

## Elastic Bean Stalk

- automates the following
	- capacity provisioning
	- load balancing
	- instance scaling
	- web app health monitoring
		- aggregated metrics
	- platform security updates
- EB Application (Logical)
	- platform (e.g. NodeJS, Java)
	- versions
		- stored in S3
	- environment
		- AMI
		- EC2 instances
		- ASG
		- deployed version
- can deployed different versions in each environment (e.g. deploy test version -> production version)
- creates a CF stack under the hood to automate this

### Create new EBS Application

- create application
- create environment
	- web server
	- upload zip of source code to EBS (exclude root folder)
	- select pizza-vpc
	-  assign public IPs to each instance
	- select both subnets
	- modify instances
		- assign ec2 security group
	- add key pair
	- modify capacity
		- change env type to load balanced
	- modify load balancer
		- edit default process
			- change port to 3000
- monitor EBS console
- update IAM Roles if not done already
	- ec2 role
		- RDS full access
		- DDB full access
		- S3 full access
		- awselasticbeanstalkwebtier
- confirm that rds instance inbound rules allow access from EC2 group
- restart instances via EBS environment
- access EBS url located in the breadcrumb

## Cloud Front

- request/response latency: time it takes for client request to reach server and server response to reach client
- addresses geographic latency
- integrates with S3,EC2,load balancers
- edges "objects" and serves them directly (e.g. CF will server content instead of S3)
- CF Distribution
	- domain
	- origin
		- object source
	- distribution behaviors (e.g. TTL)
- code agnostic
- keep in mind that connections between CF and origins occur within AWS

### Creating Distribution

- Choose EBS application as origin (AWSEB)
- (optional) add custom header to indicate that request came from CF
- Viewer Protocol Policy > Redirect HTTP to HTTPS
	- `this affects requests between client and server`
- Customize Object Caching
	- minimum TTL: 10 seconds
	- white list forward cookies
		- `AWSELB` cookies used by ELB for sticky sessions
		- `pzz4lyfe`
- Query String Forwarding and Caching
	- `Forward all, cache based on all`
- (optional) set up default root object (e.g. `index.html`)
- (optional) turn on logging
	- create S3 bucket for logging
- ETA `10 mins`

### Modify Distribution Settings

- (optional) add additional origins
- create behavior for pizza path (since this won't change)
- path pattern `pizza/*`
- Viewer Protocol Policy > Redirect HTTP to HTTPS
- Customize Object Caching
	- minimum TTL: something large (e.g. 2 hours)
	- white list forward cookies
	- `AWSELB`
	- `pzz4lyfe`
- ETA `10 mins`

### Analysis

- cache statistics
	- hits: cache contained content so CF can serve directly
	- misses: content was not cache so CF had to request from downstream
- popular objects
	- displays most requested endpoints
		- then you can optimize those requests by creating distribution behaviors for those paths

#### Verify CF

- copy domain into address bar

## ElastiCache

- cache vs DB: cache is required when rapid data retrieval is needed (e.g. session data)
- benefits
	- managed maintenance and upgrades
	- automatic read replicas
	- simple node management
	- same advantages as RDS
- Cluster
	- Node
		- single cache instance running on EC2
	- operates differently based on underlying caching engine
		- Memcached
		- Redis
		- Redis has vastly superior scaling/featureset compared to MC

### Security

- create new sg `pizza-redis-sg`
- inbound rule > allow access to `6379` from `pizza-ec2-sg`
- modify `pizza-ec2-role`
	- add elastic cache full access

### Create Redis Cluster

- (optional) enable cluster mode in production to configure multiple nodes
- `pizza-cluster`
- (optional) enable read-replica in production and increase number of replicas
- node type > t2.micro
- create new subnet group
	- `pizza-cache-group`
	- select pizza-vpc
	- select pizza-redis-sg

### Interacting with EC in Code

- utilize underlying framework functionality (e.g. Spring Session, Hapi)

#### Hapi

- add cache in `Hapi.Server`
	- name > `redis`
	- provider
		- constructor > require > `@hapi/catbox-redis`
		- options
			partition > `cache`
			host > `<redis-primary-endpoint>`
- `server.cache`
	- cache > `redis`

#### Redeploy with EBS

- create app zip
- navigate to EBS environment
- upload and deploy
	- enter version
- verify EBS domain
- test webapp
	- (optional) use CF domain instead