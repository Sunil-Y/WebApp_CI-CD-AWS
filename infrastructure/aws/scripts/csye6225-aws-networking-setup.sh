set -e
#Author: Nishita Sikka
echo "Author: Nishita Sikka"
echo "        sikka.n@husky.neu.edu"
#Usage: setting up our network infrastructure using CLI

STACK_NAME=$1
if [ $# -eq 0 ]; then
echo "PLEASE PASS <STACK_NAME> as parameter while running your script"
exit 1
fi

AWS_REGION="us-east-1"
VPC_NAME="$STACK_NAME-csye6225-vpc"
VPC_CIDR="10.0.0.0/16"

SUBNET1_PUBLIC_CIDR="10.0.1.0/24"
SUBNET1_PUBLIC_AZ="us-east-1a"
SUBNET1_PUBLIC_NAME="10.0.1.0 - us-east-1a"

SUBNET2_PUBLIC_CIDR="10.0.2.0/24"
SUBNET2_PUBLIC_AZ="us-east-1b"
SUBNET2_PUBLIC_NAME="10.0.2.0 - us-east-1b"

SUBNET3_PUBLIC_CIDR="10.0.3.0/24"
SUBNET3_PUBLIC_AZ="us-east-1c"
SUBNET3_PUBLIC_NAME="10.0.3.0 - us-east-1c"

CHECK_FREQUENCY=5

error_exit(){
      echo "$1" 1>&2
      exit 1
}

# Create VPC
echo "Creating VPC in preferred region us-east-1"

VPC_ID=$( aws ec2 create-vpc \
  --cidr-block $VPC_CIDR \
  --query 'Vpc.{VpcId:VpcId}' \
  --output text \
  --region $AWS_REGION)

# return the code from last commant is 0 then echo VPC created else failed and by convention 0 is usccessful exit
if [ "$?" = "0" ]; then
    echo "  VPC ID '$VPC_ID' CREATED in '$AWS_REGION' region."
    echo "VPCID=$VPC_ID">>"ID.txt"
else
   error_exit "Failed to Create VPC, Try again!"
fi

# Add Name tag to VPC
aws ec2 create-tags \
  --resources $VPC_ID \
  --tags "Key=Name,Value=$VPC_NAME" \
  --region $AWS_REGION
if [ "$?" = "0" ]; then
    echo "  VPC ID '$VPC_ID' NAMED as '$VPC_NAME'."
else
   error_exit "Error while naming the VPC, Try again!"
fi

#------------------------------------------------------

# Create Public Subnet 1
echo "Creating Public Subnet 10.0.1.0/24"
SUBNET1_PUBLIC_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block $SUBNET1_PUBLIC_CIDR \
  --availability-zone $SUBNET1_PUBLIC_AZ \
  --query 'Subnet.{SubnetId:SubnetId}' \
  --output text \
  --region $AWS_REGION)
if [ "$?" = "0" ]; then
     echo "  Subnet ID '$SUBNET1_PUBLIC_ID' CREATED in '$SUBNET1_PUBLIC_AZ'" \
  "Availability Zone."
    echo "SUBNET1_PUBLIC_ID=$SUBNET1_PUBLIC_ID">>"ID.txt"
else
   error_exit "Failed to create 10.0.1.0 -us-east-1a , Try again!"
fi


# Add Name tag to Public Subnet 1
aws ec2 create-tags \
  --resources $SUBNET1_PUBLIC_ID \
  --tags "Key=Name,Value=${STACK_NAME}-csye6225-Subnet1" \
  --region $AWS_REGION

if [ "$?" = "0" ]; then
    echo "  Subnet ID '$SUBNET1_PUBLIC_ID' NAMED as" \
         "'$SUBNET1_PUBLIC_NAME'."
else
   error_exit "Error while naming 10.0.1.0 -us-east-1a, Try again!"
fi

#------------------------------------------------------


# Create Public Subnet 2
echo "Creating Public Subnet 10.0.2.0/24"
SUBNET2_PUBLIC_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block $SUBNET2_PUBLIC_CIDR \
  --availability-zone $SUBNET2_PUBLIC_AZ \
  --query 'Subnet.{SubnetId:SubnetId}' \
  --output text \
  --region $AWS_REGION)

if [ "$?" = "0" ]; then
    echo "  Subnet ID '$SUBNET2_PUBLIC_ID' CREATED in '$SUBNET2_PUBLIC_AZ'" \
    "Availability Zone."
    echo "SUBNET2_PUBLIC_ID=$SUBNET2_PUBLIC_ID">>"ID.txt"
else
   error_exit "Failed to create 10.0.2.0 -us-east-1b , Try again!"
fi


# Add Name tag to Public Subnet 2
aws ec2 create-tags \
  --resources $SUBNET2_PUBLIC_ID \
  --tags "Key=Name,Value=${STACK_NAME}-csye6225-Subnet2" \
  --region $AWS_REGION

if [ "$?" = "0" ]; then
    echo "  Subnet ID '$SUBNET2_PUBLIC_ID' NAMED as" \
        "'$SUBNET2_PUBLIC_NAME'."
else
   error_exit "Error while naming 10.0.2.0 -us-east-1b, Try agian!"
fi


#------------------------------------------------------


# Create Public Subnet 3
echo "Creating Public Subnet 10.0.3.0/24"
SUBNET3_PUBLIC_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block $SUBNET3_PUBLIC_CIDR \
  --availability-zone $SUBNET3_PUBLIC_AZ \
  --query 'Subnet.{SubnetId:SubnetId}' \
  --output text \
  --region $AWS_REGION)

if [ "$?" = "0" ]; then
    echo "  Subnet ID '$SUBNET3_PUBLIC_ID' CREATED in '$SUBNET3_PUBLIC_AZ'" \
            "Availability Zone."
    echo "SUBNET3_PUBLIC_ID=$SUBNET3_PUBLIC_ID">>"ID.txt"
else
   error_exit "Failed to create 10.0.3.0 -us-east-1c , Try again!"
fi


# Add Name tag to Public Subnet 3
aws ec2 create-tags \
  --resources $SUBNET3_PUBLIC_ID \
  --tags "Key=Name,Value=${STACK_NAME}-csye6225-Subnet3" \
  --region $AWS_REGION
if [ "$?" = "0" ]; then
    echo "  Subnet ID '$SUBNET3_PUBLIC_ID' NAMED as" \
  "'$SUBNET3_PUBLIC_NAME'."
else
   error_exit "Error while naming 10.0.3.0 -us-east-1c, Try again!"
fi


#---------------------------------------------------------------------------

# Create Internet gateway
echo "Creating Internet Gateway 0.0.0.0"
IGW_ID=$(aws ec2 create-internet-gateway \
  --query 'InternetGateway.{InternetGatewayId:InternetGatewayId}' \
  --output text \
  --region $AWS_REGION)

if [ "$?" = "0" ]; then
    echo "  Internet Gateway ID '$IGW_ID' CREATED."
    echo "IGW_ID=$IGW_ID">>"ID.txt"
else
   error_exit "Error whiile creating the internet gateway, Try again!"
fi

# Setting tag name to InternetGateway
aws ec2 create-tags \
  --resources $IGW_ID \
  --tags "Key=Name,Value=${STACK_NAME}-csye6225-InternetGateway"
if [ "$?" = "0" ]; then
    echo "  IGW_ID '$IGW_ID' NAMED as '${STACK_NAME}-csye6225-InternetGateway."
else
   error_exit "Error while naming the InternetGateway, Try again!"
fi

# Attach Internet gateway to your VPC
aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID \
  --region $AWS_REGION
if [ "$?" = "0" ]; then
    echo "  Internet Gateway ID '$IGW_ID' ATTACHED to VPC ID '$VPC_ID'."
else
   error_exit "Failed to attach the internet gateway with the VPC, Try again!"
fi

# Need to create a new route table rather than the one created by default

# Create Route Table
echo "Creating Route Table..."
ROUTE_TABLE_ID=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --query 'RouteTable.{RouteTableId:RouteTableId}' \
  --output text \
  --region $AWS_REGION)
if [ "$?" = "0" ]; then
    echo "  Route Table ID '$ROUTE_TABLE_ID' CREATED."
    echo "ROUTE_TABLE_ID=$ROUTE_TABLE_ID">>"ID.txt"
else
   error_exit "Error while creating the Route Table, Try again!"
fi

# Setting tag name to route table
aws ec2 create-tags \
  --resources $ROUTE_TABLE_ID \
  --tags "Key=Name,Value=${STACK_NAME}-csye6225-public-route-table"
if [ "$?" = "0" ]; then
    echo "  ROUTE_TABLE_ID '$ROUTE_TABLE_ID' NAMED as '${STACK_NAME}-csye6225-public-route-table."
else
   error_exit "Error while naming the Routing table, Try again!"
fi

# Create route to Internet Gateway
RESULT=$(aws ec2 create-route \
  --route-table-id $ROUTE_TABLE_ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID \
  --region $AWS_REGION)
if [ "$?" = "0" ]; then
    echo "  Route to '0.0.0.0/0' via Internet Gateway ID Successfull '$IGW_ID' ADDED to" \
            "Route Table ID '$ROUTE_TABLE_ID'."
else
   error_exit "Failed to attach the route with the internet gateway, Try again!"
fi

# Associate Public Subnet 1 with Route Table
RESULT=$(aws ec2 associate-route-table  \
  --subnet-id $SUBNET1_PUBLIC_ID \
  --route-table-id $ROUTE_TABLE_ID \
  --region $AWS_REGION)
if [ "$?" = "0" ]; then
    echo "  Public Subnet ID 1 '$SUBNET1_PUBLIC_ID' ASSOCIATED with Route Table ID" \
          "'$ROUTE_TABLE_ID'."
else
   error_exit "Error while associating 10.0.1.0 to the Route Table"
fi



  # Associate Public Subnet 2 with Route Table
RESULT=$(aws ec2 associate-route-table  \
  --subnet-id $SUBNET2_PUBLIC_ID \
  --route-table-id $ROUTE_TABLE_ID \
  --region $AWS_REGION)
if [ "$?" = "0" ]; then
    echo "  Public Subnet ID 2 '$SUBNET2_PUBLIC_ID' ASSOCIATED with Route Table ID" \
          "'$ROUTE_TABLE_ID'."
else
   error_exit "Error while associating 10.0.2.0 to the Route Table"
fi


  # Associate Public Subnet 3 with Route Table
RESULT=$(aws ec2 associate-route-table  \
  --subnet-id $SUBNET3_PUBLIC_ID \
  --route-table-id $ROUTE_TABLE_ID \
  --region $AWS_REGION)
if [ "$?" = "0" ]; then
    echo "  Public Subnet ID 3 '$SUBNET3_PUBLIC_ID' ASSOCIATED with Route Table ID" \
        "'$ROUTE_TABLE_ID'."
else
   error_exit "Error while associating 10.0.3.0 to the Route Table"
fi

#------------------------------------------------------

  # Revoking the default rules for the default rules of VPC

SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --filters Name=vpc-id,Values=${VPC_ID})
security_id=$(echo -e "$SECURITY_GROUP_ID" | jq '.SecurityGroups[0].GroupId' | tr -d '"')

  # Access Revoke for the default security group
SECURITY_GROUP_1=$(aws ec2 revoke-security-group-ingress \
 --group-id "$security_id" \
 --protocol all --port all \
 --source-group "$security_id")
SECURITY_GROUP_2=$(aws ec2 revoke-security-group-egress \
 --group-id "$security_id" \
 --protocol all --port all \
 --cidr 0.0.0.0/0)
if [ "$?" = "0" ]; then
    echo " Revoke Access "
else
   error_exit "Error while revoking, Try Again!"
fi

  # Modifying the rules for TCP on port 80 and 22
SECURITY_GROUP_3=$(aws ec2 authorize-security-group-ingress \
 --group-id "$security_id" \
 --protocol tcp \
 --port 22 --cidr 0.0.0.0/0)
SECURITY_GROUP_4=$(aws ec2 authorize-security-group-ingress \
 --group-id "$security_id" \
 --protocol tcp \
 --port 80 --cidr 0.0.0.0/0)
if [ "$?" = "0" ]; then
    echo " Modified the rules for TCP on port 80 and 22 "
else
   error_exit "Error while modifying, Try Again!"
fi

echo "Great! Job Done! Successful!"
