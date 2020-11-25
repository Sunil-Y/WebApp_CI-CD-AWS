#!/bin/bash

cd csye-webapp/webapp

# sudo killall node

# sudo cp /var/.env .

# sudo npm i pm2 -g
sudo npm install

echo 'npm installed'

[ -f /opt/cloudwatch-config.json ] && echo "Found" || sudo touch /opt/cloudwatch-config.json

sudo cp /csye-webapp/infrastructure/aws/codedeploy/cloudwatch-config.json /opt/cloudwatch-config.json
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/cloudwatch-config.json -s

echo "Cloud Wacth agent started"