
echo "Stack name to be deleted:"
read Stack_Name

Stack_Name=${Stack_Name}
echo "Deleting Stack ......"

aws cloudformation delete-stack --stack-name $Stack_Name

aws cloudformation wait stack-delete-complete --stack-name $Stack_Name

if [ $? -eq 0 ]; then
echo "Stack Deleted"
else
echo "Unable to delete stack. Please input correct name!!"
fi
