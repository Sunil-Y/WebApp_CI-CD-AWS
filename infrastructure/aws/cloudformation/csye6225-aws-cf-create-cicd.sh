#!/bin/bash

echo "Please enter Stack Name"
read stackName

aws cloudformation create-stack --stack-name $stackName \
--no-enable-termination-protection --template-body  file://./csye6225-aws-cf-create-cicd-stack.json \
--capabilities "CAPABILITY_NAMED_IAM"
 
echo "--------------------------"
if [ -z $stackName ]; then
    echo 'Error Occured'
else
    echo 'Stack Creation begun'
    aws cloudformation wait stack-create-complete --stack-name $stackName
    echo 'Stack Creation Completed'
fi