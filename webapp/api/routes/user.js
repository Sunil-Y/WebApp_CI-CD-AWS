const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const aws = require('aws-sdk');
var saltRounds = process.env.SALT_ROUNDS;
var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
var emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
aws.config.update({region: 'us-east-1'});
var cloudWatch = new aws.CloudWatch({apiVersion: '2010-08-01'});
var registerUserCounter = 0;


// Winston logging for cloudwatch
var winston = require('winston'), WinstonCloudWatch = require('winston-cloudwatch');

const logger = winston.createLogger({
  transports:[
    new WinstonCloudWatch({
      logGroupName:'test-log-group',
      logStreamName: 'test-log-stream',
      awsRegion:'us-east-1'
    })
  ]
})

var saltRounds = process.env.SALT_ROUNDS;
const db = require("../../queries.js");

module.exports = router;

router.route("/register").post((req,res) => {

    registerUserCounter ++;
    var params = {
      MetricData: [
        {
          MetricName: 'api - POST /user/register',
          Dimensions: [
            {
              Name: 'api',
              Value: 'counter'
            },
          ],
          Timestamp: new Date ,
          Unit: 'None',
          Value: registerUserCounter
        },
      ],
      Namespace: 'UserRegisterApi/traffic'
    };
    cloudWatch.putMetricData(params, (error, data)=>{
      if(error){
        logger.info("Error", error);
      }
      else{
        logger.info("Success", JSON.stringify(data));
      }
    });
    //Storing the data passed through the body
    console.log(JSON.stringify(req.body)); 
    var password = req.body.password;
    console.log(password);
    var email = req.body.email;

    if(!(email && password)){
        res.status(400).json({response:{
            message: "Enter password and email"
        }}).send();
    }
    else{

    validateEmail(email, function(isValidEmail){
        if(!isValidEmail){
            res.status(422).json({response:{
                message: "Not a valid email address"
            }});
        }
        else{

            //Function call for validating the password strength
            validatePassword(password, function(data){
                
                if(data=="invalid"){
                    res.status(422).json({response:{
                        message: "Weak password according to NIST standard"
                    }});
                }
                else{
                    db.getUser(email, function(result){
                        //console.log("After the query");
                        if(result.length >= 1){
                            res.status(409).json({response:{
                                message:"User already exists"
                            }}).send();
                            
                        }
                        else{
                            passwordToHash(password, function(hash){
                                db.createUser(email,hash, function(result){
                                    if(result){
                                        res.status(201).json({response:{
                                            message: "User registered successfully"
                                        }}).send();
                                        logger.info("User added to database successfully ");

                                    }
                                    else{
                                        res.status(500).json({response:{
                                            message: "Something went wrong, please try again"
                                        }}).send();
                                        logger.error("Failed to add User to database");
                                    }
                                    
                                });
                            });
                        }
                    
                    });
                }
            });
        }
    });

    }
});


var validatePassword = (password,callback) => {
        //console.log(strongRegex);
        //console.log("This is pass",password);
        var decision = strongRegex.test(password);
        //console.log("This is the decision"+ decision);
        if(decision){
            callback("valid");
        }
        else{
            callback("invalid");
        }
}

var passwordToHash = (password, callback) => {
    //Generating the salt
    var salt = bcrypt.genSaltSync(Number(saltRounds));
    //Generating hash for the password passed
    var hash = bcrypt.hashSync(password, salt);

    callback(hash);
}

var validateEmail = (email,callback) => {
    let isValidEmail = emailRegex.test(email);
    //console.log("This is the decision"+ decision);
    if(isValidEmail){
        callback(true);
    }
    else{
        callback(false);
    }
}

var snsparams = {
    Name: 'password_reset',
    Attributes: {
      'DisplayName': 'password_reset',
    }
  };
  

// Sending the email and reset_link to SNS
router.route('/reset').post((req,res) => {
    var topicArn;
    var from_email = 'do-not-reply@' + process.env.DOMAIN_NAME;
    var token = uuidv4();
    if(req.body.email && req.body.email !== ""){
        db.getUser(req.body.email, (data) => {
            if(data.length > 0){
                var snsObject = new aws.SNS({apiVersion:'2010-03-31'});
                snsObject.createTopic(snsparams, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else{
                        topicArn = data.TopicArn;
                        aws.config.update({'region':'us-east-1'});
                        var message = {
                            token:token,
                            fromemail:from_email,
                            email:req.body.email,
                            reset_link:'Your Password link is here  https://'+ process.env.DOMAIN_NAME +'/reset?email='+req.body.email+'&token='+token
                        };
            
                        var lambdaparams = {
                            Message: JSON.stringify(message),
                            TopicArn: topicArn
                        }
                        console.log("These are params", lambdaparams);
                        // Create promise and SNS service object
                        snsObject.publish(lambdaparams,function(err,data) {
                            if(err){
                                console.log("There is error", err);
                            }
                            else{
                                console.log("Message",lambdaparams.Message,'send sent to the topic', lambdaparams.TopicArn);
                                console.log("MessageID is " + data.MessageId);
                                res.status(200).json({response: {
                                    message:'Password link message sent'
                                }});
                            }
                            
                        } );
                        
                        
                    } 
                  });

                
            }
            else{
                res.status(400).json({response: {
                    message:'User does not exists in database'
                }})
            }
        })
    }
    else{
        res.status(400).json({response:{
            message: "Please enter a email_id"
        }})
    }

    
    

});

