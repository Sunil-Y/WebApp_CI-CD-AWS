#!/bin/bash

STACK_NAME=$1
if [ $# -eq 0 ]; then
echo "PLEASE PASS <STACK_NAME> as parameter while running your script"
exit 1
fi

echo "Deleting Stack"

#Delete the cloudformation stack
aws cloudformation delete-stack --stack-name $STACK_NAME

aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME

#Job Done
echo "Stack Deleted!"