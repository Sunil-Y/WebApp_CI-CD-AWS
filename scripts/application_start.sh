#!/bin/bash
ls
cd csye-webapp/webapp

sudo pm2 stop server
echo "PM2 stopped"
sudo pkill -f PM2
echo "pkill -f PM2 Done"
sudo pm2 start server.js
echo "pm2 start server.js Done"
sudo pm2 startup
echo "pm2 startup Done"
sudo pm2 save

echo 'pm2 started'