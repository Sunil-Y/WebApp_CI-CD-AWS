#!/bin/bash

echo "Please enter Environment Name"
read envName
echo "Please enter VPC CIDR"
read vpcCidr
echo "Please enter publicSubnet1Cidr"
read publicSubnet1Cidr
echo "Please enter publicSubnet2Cidr"
read publicSubnet2Cidr
echo "Please enter publicSubnet3Cidr"
read publicSubnet3Cidr
echo "Please enter publicSubnet4Cidr"
read publicSubnet4Cidr
echo "Please enter stack name"
read stackName


aws cloudformation create-stack --stack-name $stackName \
--no-enable-termination-protection --template-body  file://./csye6225-cf-networking.json \
--parameters ParameterKey=environmentName,ParameterValue=$envName \
 ParameterKey=vpcCidr,ParameterValue=$vpcCidr \
 ParameterKey=publicSubnet1Cidr,ParameterValue=$publicSubnet1Cidr \
 ParameterKey=publicSubnet2Cidr,ParameterValue=$publicSubnet2Cidr \
 ParameterKey=publicSubnet3Cidr,ParameterValue=$publicSubnet3Cidr \
 ParameterKey=publicSubnet4Cidr,ParameterValue=$publicSubnet4Cidr \
 ParameterKey=stackName,ParameterValue=$stackName
 
echo "--------------------------"
if [ -z $stackName ]; then
    echo 'Error Occured'
else
    echo 'Stack Creation begun'
    aws cloudformation wait stack-create-complete --stack-name $stackName
    echo 'Stack Creation Completed'
fi
 



