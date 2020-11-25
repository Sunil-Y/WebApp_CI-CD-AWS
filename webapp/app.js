const createError = require('http-errors');
const express = require('express');
const path = require('path');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const basicAuth = require('basic-auth');
const db = require('./queries');
const bcrypt = require('bcrypt');
const aws = require('aws-sdk');
const winston = require('winston');
var date = new Date();
var getTimeCounter = 0;

// DB Config
const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
})

// Route Decleration
const userRoutes = require('./api/routes/user');
const notesRoutes = require('./api/routes/notes');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Winston Logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [ 
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
aws.config.update({region: 'us-east-1'});
var cloudWatch = new aws.CloudWatch({apiVersion: '2010-08-01'});

// Application begins
app.use('/user', userRoutes);
app.use('/note', notesRoutes);

//app.use(fileUpload());
var auth = (request, response, next) => {
  var user = basicAuth(request);
  if(!user || !user.name || !user.pass){
    response.set('WWW-Authenticate', 'Basic realm=User not logged in');
    response.status(401).json({response:{
        message: "You are not logged in"
        }
    }).send();
  }
  else{
    db.getUser(user.name, function(data){
        if(data.length <=0){
            //in the database if there are is an item not saved the lenght is 0
            response.status(401).json({response:{
                message: "Invalid Credentials"
            }});
        }
        else{
            var userPassHash = data[0].password;
            if(bcrypt.compareSync(user.pass, userPassHash)){
                next();
            }
            else{
                response.status(401).json({response:{
                    message: "Invalid Credentials"
                }});
            }
        }
    });
    
  }
}

app.get('/', auth, (request, response) => { 
   //!!!whenever hitting base URL, always send a response back
  getTimeCounter ++;
  console.log(getTimeCounter);
  var params = {
    MetricData: [
      {
        MetricName: 'api - GET /',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Unit: 'None',
        Value: getTimeCounter
      },
    ],
    Namespace: 'TimeApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });
   createTables(()=>{
    response.status(200).json({response: {
      message: "Authenticated at " + date.toLocaleTimeString()
  }});  
  response.end();
   });
         //else server will get hung up
});

app.use(function (req, res, next) {    
    res.header('Access-Control-Allow-Origin', '*');
    // Request headers you wish to allow
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use((req, res, next) =>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

var createTables = (callback)=>{
  pool.query((`CREATE TABLE IF NOT EXISTS users (id SERIAL, 
                                                email VARCHAR(30) NOT NULL,
                                                password VARCHAR(200));`),() => {

    pool.query((`CREATE TABLE IF NOT EXISTS notes (id VARCHAR(200) NOT NULL, 
                                                    title VARCHAR(50) NOT NULL, 
                                                    content VARCHAR(50) NOT NULL, 
                                                    user_id INT NOT NULL, 
                                                    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, 
                                                    last_updated_on TIMESTAMP);`), ()=>{

      pool.query((`CREATE TABLE IF NOT EXISTS attachments (id VARCHAR(200) NOT NULL,
                                                          url varchar(200),
                                                          note_id VARCHAR(200) NOT NULL,
                                                          file_name VARCHAR(200));`),() =>{
        callback();

      });
    });
  });
}
module.exports = app;








