#!/bin/bash

echo "Please enter the networking stack name"
read netstack
echo "Please enter Stack Name"
read stackName
echo "Please enter Amazon Machine Image Id"
read imgId
#echo "Please enter the VPC ID"
#read VPCId
sid=$(aws cloudformation describe-stacks --stack-name $netstack --query Stacks[0].StackId --output text)
echo "Stack Id: $sid"
VPCId=$(aws ec2 describe-vpcs --filter "Name=tag:aws:cloudformation:stack-id,Values=$sid" --query Vpcs[0].VpcId --output text)
echo "VPC Id: $VPCId"
InstType="t2.micro"
volumeSize="20"
volumeType="gp2"
echo "Please enter the public key name"
read keyName
echo "Please enter the public Tag Value"
read tagValue
appName="csye6225-webapp"
deploymentGroupName="csye6225-webapp-deployment"
subnetId1=$(aws ec2 describe-subnets --filter "Name=tag:Name,Values=$netstack-csye6225-subnet1" --query Subnets[0].SubnetId --output text)
echo "SubnetId1: $subnetId1"
#echo "Please enter Subnet1 Id - Public Subnet"
#read subnetId1
subnetId2=$(aws ec2 describe-subnets --filter "Name=tag:Name,Values=$netstack-csye6225-subnet2" --query Subnets[0].SubnetId --output text)
echo "SubnetId2: $subnetId2"
#echo "Please enter Subnet2 Id - Private Subnet"
#read subnetId2
subnetId3=$(aws ec2 describe-subnets --filter "Name=tag:Name,Values=$netstack-csye6225-subnet3" --query Subnets[0].SubnetId --output text)
echo "SubnetId3: $subnetId3"
#echo "Please enter Subnet3 Id - Private Subnet"
#read subnetId3
subnetId4=$(aws ec2 describe-subnets --filter "Name=tag:Name,Values=$netstack-csye6225-subnet4" --query Subnets[0].SubnetId --output text)
echo "SubnetId4: $subnetId4"
#echo "Please enter Subnet4 Id - Public Subnet"
#read subnetId4
echo "Please enter the object storage S3 bucket name"
read s3BucketName
echo "Please enter the domain name"
read DomainName
sslArn=$(aws acm list-certificates --query CertificateSummaryList[0].CertificateArn --output text)
echo "sslArn: $sslArn"
nowafsslArn=$(aws acm list-certificates --query CertificateSummaryList[1].CertificateArn --output text)
echo "sslArn: $nowafsslArn"

aws cloudformation create-stack --stack-name $stackName \
--no-enable-termination-protection --template-body  file://./csye6225-cf-auto-scaling-application.json \
--capabilities "CAPABILITY_NAMED_IAM" \
 --parameters ParameterKey=imgId,ParameterValue=$imgId \
 ParameterKey=vpcId,ParameterValue=$VPCId \
 ParameterKey=InstType,ParameterValue=$InstType \
 ParameterKey=volumeSize,ParameterValue=$volumeSize \
 ParameterKey=volumeType,ParameterValue=$volumeType \
 ParameterKey=tagValue,ParameterValue=$tagValue \
 ParameterKey=appName,ParameterValue=$appName \
 ParameterKey=deploymentGroupName,ParameterValue=$deploymentGroupName \
 ParameterKey=keyName,ParameterValue=$keyName \
ParameterKey=subnetId1,ParameterValue=$subnetId1 \
ParameterKey=subnetId2,ParameterValue=$subnetId2 \
ParameterKey=subnetId3,ParameterValue=$subnetId3 \
ParameterKey=subnetId4,ParameterValue=$subnetId4 \
ParameterKey=s3BucketName,ParameterValue=$s3BucketName \
ParameterKey=DomainName,ParameterValue=$DomainName \
ParameterKey=sslArn,ParameterValue=$sslArn \
ParameterKey=nowafsslArn,ParameterValue=$nowafsslArn 

 
echo "--------------------------"
if [ -z $stackName ]; then
    echo 'Error Occured'
else
    echo 'Stack Creation begun'
    aws cloudformation wait stack-create-complete --stack-name $stackName
    echo 'Stack Creation Completed'
fi