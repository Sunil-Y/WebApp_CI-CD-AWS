
echo "Stack name to be deleted:"
read Stack_Name

Stack_Name=${Stack_Name}

instanceId=$(aws ec2 describe-instances --query "Reservations[*].Instances[*].InstanceId[]" --filters "Name=tag-key,Values=aws:cloudformation:stack-name" "Name=tag-value,Values=$Stack_Name" --output=text)

echo "Instance id is: ${instanceId}"
aws ec2 stop-instances --instance-ids $instanceId

aws ec2 wait instance-stopped --instance-ids $instanceId

echo "Instance Stopped"

aws cloudformation delete-stack --stack-name $Stack_Name

aws cloudformation wait stack-delete-complete --stack-name $Stack_Name

if [ $? -eq 0 ]; then
echo "Stack Deleted"
else
echo "Unable to delete stack. Please input correct name!!"
fi
