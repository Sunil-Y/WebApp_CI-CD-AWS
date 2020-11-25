# Infrastructure as a Code using AWS CLI

## Setup
- Create and configure required networking infrastructure using the AWS CLI. Script should take STACK_NAME as a parameter and creates the following : 
  - Virtual Private Cloud (VPC) resource called STACK_NAME-csye6225-vpc
  - Internet Gateway resource called STACK_NAME-csye6225-InternetGateway- 
  - Internet Gateway to STACK_NAME-csye6225-vpc VPC
  - Public Route Table called STACK_NAME-csye6225-public-route-table
  - Public route in STACK_NAME-csye6225-public-route-table route table with destination CIDR block 0.0.0.0/0 and STACK_NAME-csye6225-InternetGateway as the target
  - Revoke the default Security Group for VPC created and modify the rules for TCP on port 22 and 80 i.e. HTTP and SSH. 

Create the script for the network infractrcuture setup

Usage: `./csye6225-aws-networking-setup.sh [StackName]`


## Teardown
- This Script should delete all networking resources using AWS CLI. Teardown script will read all resources ID form [StackName].log and delete them by using AWC CLI.
- Don't forget provide the correct STACK_NAME

Create the script for the network infractrcuture Teardown

Usage: `./csye6225-aws-networking-teardown.sh [StackName]`
