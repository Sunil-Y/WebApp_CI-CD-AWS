set -e
#Author: Sunil Yadav
echo "Author: Sunil Yadav"
echo " yadav.su@husky.neu.edu"
#Usage: Deleting our networking resources such as Virtual Private Cloud (VPC), Internet Gateway, Route Table and Routes

#Arguments: STACK_NAME
STACK_NAME=$1
if [ $# -eq 0 ]; then
echo "PLEASE PASS <STACK_NAME> as parameter while running your script"
exit 1
fi

error_exit(){
      echo "$1" 1>&2
      exit 1
}

#Get a vpc-Id using the name provided
vpcId=`aws ec2 describe-vpcs --filter "Name=tag:Name,Values=${STACK_NAME}-csye6225-vpc" --query 'Vpcs[*].{id:VpcId}' --output text`
#Get a Internet Gateway Id using the name provided
gatewayId=`aws ec2 describe-internet-gateways --filter "Name=tag:Name,Values=${STACK_NAME}-csye6225-InternetGateway" --query 'InternetGateways[*].{id:InternetGatewayId}' --output text`
#Get a route table Id using the name provided
routeTableId=`aws ec2 describe-route-tables --filter "Name=tag:Name,Values=${STACK_NAME}-csye6225-public-route-table" --query 'RouteTables[*].{id:RouteTableId}' --output text`

#Get subnet Id 
subnet1Id=`aws ec2 describe-subnets --filter "Name=tag:Name,Values=${STACK_NAME}-csye6225-Subnet1" --query 'Subnets[*].{id:SubnetId}' --output text`
echo "Subnet 1  - $subnet1Id "

subnet2Id=`aws ec2 describe-subnets --filter "Name=tag:Name,Values=${STACK_NAME}-csye6225-Subnet2" --query 'Subnets[*].{id:SubnetId}' --output text`
echo "Subnet 2  - $subnet2Id "

subnet3Id=`aws ec2 describe-subnets --filter "Name=tag:Name,Values=${STACK_NAME}-csye6225-Subnet3" --query 'Subnets[*].{id:SubnetId}' --output text`
echo "Subnet 3  - $subnet3Id "

echo "Deleting subnet 1 ..."
aws ec2 delete-subnet --subnet-id $subnet1Id

if [ "$?" = "0" ]; then
    echo "  Subnet 1 '$subnet1Id' deleted successfully "
    echo "subnet1Id=$subnet1Id">>"ID.txt"
else
   error_exit "Failed to delete subnet 1 Id- $subnet1Id , Try again!"
fi

echo "Deleting subnet 2 ..."
aws ec2 delete-subnet --subnet-id $subnet2Id

if [ "$?" = "0" ]; then
    echo "  Subnet 2 '$subnet2Id' deleted successfully "
    echo "subnet1Id=$subnet2Id">>"ID.txt"
else
   error_exit "Failed to delete subnet 2 Id- $subnet2Id , Try again!"
fi


echo "Deleting subnet 3 ..."
aws ec2 delete-subnet --subnet-id $subnet3Id

if [ "$?" = "0" ]; then
    echo "  Subnet 3 '$subnet3Id' deleted successfully "
    echo "subnet1Id=$subnet3Id">>"ID.txt"
else
   error_exit "Failed to delete subnet 3 Id- $subnet3Id , Try again!"
fi


#Delete the route
echo "Deleting the route..."
aws ec2 delete-route --route-table-id $routeTableId --destination-cidr-block 0.0.0.0/0

if [ "$?" = "0" ]; then
    echo "  route deleted successfully "
else
   error_exit "Failed to delete route , Try again!"
fi


#Delete the route table
echo "Deleting the route table-> route table id: "$routeTableId
aws ec2 delete-route-table --route-table-id $routeTableId

if [ "$?" = "0" ]; then
    echo "  route table -  $routeTableId deleted successfully "
    echo "routetableid = $routeTableId">>"ID.txt"
else
   error_exit "Failed to delete route table  $routeTableId , Try again!"
fi

#Detach Internet gateway and vpc
echo "Detaching the Internet gateway from vpc..."
aws ec2 detach-internet-gateway --internet-gateway-id $gatewayId --vpc-id $vpcId

if [ "$?" = "0" ]; then
    echo "  Internet gateway  -  $gatewayId detached successfully with VPC - $vpcId "
    echo "Internet gateway = $gatewayId">>"ID.txt"
else
   error_exit "Failed to detach Internet gateway  $gatewayId  with VPC - $vpcId  , Try again!"
fi


#Delete the Internet gateway
echo "Deleting the Internet gateway-> gateway id: "$gatewayId
aws ec2 delete-internet-gateway --internet-gateway-id $gatewayId

if [ "$?" = "0" ]; then
    echo "  Internet gateway  -  $gatewayId deleted successfully. "
    echo "Internet gateway = $gatewayId">>"ID.txt"
else
   error_exit "Failed to delete Internet gateway  $gatewayId  , Try again!"
fi

#Delete the vpc
echo "Deleting the vpc-> vpc id: "$vpcId
aws ec2 delete-vpc --vpc-id $vpcId

if [ "$?" = "0" ]; then
    echo "  VPC  -  $vpcId deleted successfully. "
    echo "VPC  -  $vpcId">>"ID.txt"
else
   error_exit "Failed to delete VPC  $vpcId  , Try again!"
fi

echo "Job done!"