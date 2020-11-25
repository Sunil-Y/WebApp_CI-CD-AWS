const express = require('express');
const router = express.Router();
const db = require("../../queries");
const bcrypt = require('bcrypt');
const basicAuth = require('basic-auth');
const uuidv4 = require('uuid/v4');
const multer = require('multer');
const fs = require('fs');
const aws = require('aws-sdk');
const uploadFolder = './uploads/'
const s3Upload = require('../../services/image-upload');
const s3singleUpload = s3Upload.upload.single('attachment');

var allNotesCounter = 0;
var getNoteCounter = 0;
var deleteNoteCounter = 0;
var updateNoteCounter = 0;
var createNoteCounter = 0;
var createAttachmentCounter = 0;
var allAttachmentsCounter = 0;
var updateAttachmentCounter = 0;
var deleteAttachmentCounter = 0;
var getAttachmentCounter = 0;
 
aws.config.update({region: 'us-east-1'});
var cloudWatch = new aws.CloudWatch({apiVersion: '2010-08-01'});

// Winston logging for cloudwatch
var winston = require('winston'), WinstonCloudWatch = require('winston-cloudwatch');

const logger = winston.createLogger({
  transports:[
    new WinstonCloudWatch({
      logGroupName:'csye6225_spring2019',
      logStreamName: 'webapp',
      awsRegion:'us-east-1'
    })
  ]
})

const currentEnvironment = process.env.NODE_ENV;

 const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, uploadFolder);
    },
    filename: function(req,file,callback){
        callback(null, Date.now() + file.originalname);
    }

}); 

const upload = multer({storage:storage}).array('attachment',1);


module.exports = router;

//Api for getting all the notes by a user
router.route("/").get((req,res) => {
  
  allNotesCounter ++;
  var params = {
    MetricData: [
      {
        MetricName: 'api - GET /note/',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Timestamp: new Date ,
        Unit: 'None',
        Value: allNotesCounter
      },
    ],
    Namespace: 'GetAllNotesApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });
    validateBasicAuth(req,res, function(userId){

        db.getAllNotes(userId, function(result){
            console.log("result : " + result.rowCount );
            if(result.rowCount == undefined || result.rowCount <= 0){
                res.status(204).send();
            }
            else{
                getAttachmentForNotes(result, function(finalData){
                    console.log("After for");
                    res.status(200).json(finalData['rows']).send();
                });
            }
        });
        
    });
});

function getAttachmentForNotes(result,callback){
    let counter = 0;
    for (let i = 0; i < result['rows'].length; i++) {
        let noteId = result['rows'][i].id;
        console.log("noteId : " + noteId);
        db.getAllAttachments(noteId, function(attachments){
            console.log("i " + i);
            result['rows'][i]["attachments"] = attachments.rows;
            counter++;
            if(counter == result['rows'].length){
                callback(result)
            }
        });
    }

}

//Api for getting a single note using its id
router.route("/:id").get((req,res) => {
  
  getNoteCounter ++;
  var params = {
    MetricData: [
      {
        MetricName: 'api - GET /note/:id',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Unit: 'None',
        Value: getNoteCounter
      },
    ],
    Namespace: 'GetNoteApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });
  
  var id = req.params.id;

    validateBasicAuth(req,res, function(userId){
        db.getSingleNote(userId, id, function(result){
            if(result['rowCount'] == 0){
                res.status(404).send();
            }
            else{
                db.getAllAttachments(id, function(attachments){
                    let finalResult = result.rows;
                    finalResult[0]["attachments"] = attachments.rows;
                    res.status(200).json(finalResult);
                });
                
            }
        });
    });
});



//Api for deleting a note 
router.route('/:id').delete((req,res) => {

  deleteNoteCounter ++;
  var params = {
    MetricData: [
      {
        MetricName: 'api - DEL /note/:id',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Unit: 'None',
        Value: deleteNoteCounter
      },
    ],
    Namespace: 'DeleteNoteApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });

    var id = req.params.id;

    validateBasicAuth(req,res, function(userId){
        //console.log("This is the result", results);
        db.deleteNote(userId, id,function(results){
            if(results['rowCount'] == 0){
                res.status(400).send();
                logger.error("note not found in database");
            }
            else{
                res.status(204).json({response:{
                    message: "Delete Sucessfull"
                }})
                logger.info("Note deletion successful on database");
            }
        });
    });
});
    
// API for creating a note
router.route("/").post((req,res) => {

  createNoteCounter ++;
  var params = {
    MetricData: [
      {
        MetricName: 'api - POST /note/',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Unit: 'None',
        Value: createNoteCounter
      },
    ],
    Namespace: 'CreateNoteApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });

    var title = req.body.title;
    var content = req.body.content;

    validateBasicAuth(req, res, function(userId) {
        if (!(title && content)) {
            res.status(400).json({
                response: {
                    message: "Bad request"
                }
            }).send();
        }

             else {
            db.createNotes(uuidv4(), title, content, userId, function (result) {
                if (result) {
                    res.status(201).send(result);
                    logger.info('Note created successfully.');
                }

            });
        }
             });
});

// API for updating a note
router.route('/:id').put((request, response) => {

  updateNoteCounter ++;
  var params = {
    MetricData: [
      {
        MetricName: 'api - PUT /note/:id',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Unit: 'None',
        Value: updateNoteCounter
      },
    ],
    Namespace: 'UpdateNoteApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });
  // console.log(request);
  validateBasicAuth(request, response , (user_id) =>{
    var id = request.params.id;
    var title = request.body.title;
    var content = request.body.content;

    if(!(title && content)){
      response.status(400).json({
        response:{
          message: "Bad Request"
        }
      });
    }
    else{
        isUserAuthorized(id,user_id,request,response, (isAuth) => {
                if(isAuth == "Authorized"){
                db.updateNote(id,title, content, user_id, (result) => {
                    console.log(result);
                    if(result.length >= 1){
                        db.getAllAttachments(id, function(attachments){
                            let finalResult = result;
                            finalResult[0]["attachments"] = attachments.rows;
                            response.status(200).json(finalResult);
                        });   
                        logger.info("Note updation successful");                     
                    }
                    else {
                      response.status(204).send();
                    }
                  });
                }
        });
    }
  });
});


// API for attaching image in note
router.route('/:note_id/attachments').post((request, response) => {

  createAttachmentCounter ++;
  var params = {
    MetricData: [
      {
        MetricName: 'api - POST /note/:id/attachments',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Unit: 'None',
        Value: createAttachmentCounter
      },
    ],
    Namespace: 'CreateAttachmentApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });

  let note_id = request.params.note_id;
  validateBasicAuth(request, response , (user_id) =>{
    isUserAuthorized(note_id,user_id,request,response, (isAuth) => {
      if(isAuth == "Authorized"){
        if(currentEnvironment == 'default'){
          upload(request, response, function (error) {
            if (error) {
              console.log(error);
                response.status(500).json({response:{message:error}}).send();
            }
            else{
              let attachmentUrl = 'http://' + request.get('host')+ '/' + request.files[0].path;
              let fileName = attachmentUrl.split('/').pop().replace(/%20/g, " ");
              addDataToDB(note_id, request, response, attachmentUrl,fileName);
            }
        });
        }
        else if(currentEnvironment == 'dev'){
          s3singleUpload(request, response, (err) =>{
            if(err){
              throw err
            }
            else{
              let imageUrl = request.file.location;
              let fileName = imageUrl.split('/').pop().replace(/%20/g, " ");
              addDataToDB(note_id, request, response, imageUrl, fileName);
            }
          });
        }
      }
    });
  });

});

// API for getting all attachments by note_id
router.route('/:note_id/attachments').get((request, response) => {

  allAttachmentsCounter ++;
  var params = {
    MetricData: [
      {
        MetricName: 'api - GET /note/:id/attachments',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Unit: 'None',
        Value: allAttachmentsCounter
      },
    ],
    Namespace: 'GetAllAttachmentsApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });
  let note_id = request.params.note_id;
  validateBasicAuth(request, response , (user_id) =>{
    isUserAuthorized(note_id,user_id,request,response, (isAuth) => {
      if(isAuth == "Authorized"){
          getAllAttachments(note_id, response);
      }
    });
  });
});

//API to update an attachment in a note
router.route('/:note_id/attachments/:attachment_id').put((request, response) => {

  updateAttachmentCounter ++;
  var params = {
    MetricData: [
      {
        MetricName: 'api - UPDATE /note/:id/attachment/:id',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Unit: 'None',
        Value: updateAttachmentCounter
      },
    ],
    Namespace: 'UpdateAttachmentApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });
  let note_id = request.params.note_id;
  let attachment_id = request.params.attachment_id;

  validateBasicAuth(request, response , (user_id) =>{
    isUserAuthorized(note_id,user_id,request,response, (isAuth) => {
      if(isAuth == "Authorized"){
        if(currentEnvironment == 'default'){
          upload(request, response, function (error) {
            if (error) {
              response.status(500).json({response:{message:error}}).send();
              }
            else{
              let attachmentUrl = 'http://' + request.get('host')+ '/' + request.files[0].path;
              let newFileName = attachmentUrl.split('/').pop().replace(/%20/g, " ");                    
              updateDataInDB(note_id, attachment_id,request, response, attachmentUrl,newFileName);
            }
          });
        }
        else if(currentEnvironment == 'dev'){
          db.getAttachmentById(attachment_id, note_id, (data)=>{
            if(data && data.rowCount > 0){
              let fileName = data.rows[0].file_name;
              console.log(fileName);
              s3Upload.deleteObject(request, response, fileName, (data)=>{
                // if (data){
                  s3singleUpload(request, response, (err) =>{
                    if(err){
                      return response.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}]});
                    }
                    else{
                      let imageUrl = request.file.location;
                      console.log(imageUrl);
                      let newFileName = imageUrl.split('/').pop().replace(/%20/g, " ");
                      updateDataInDB(note_id, attachment_id, request, response, imageUrl, newFileName);
                    }
                  });
              });
            } 
            else {
                response.status(400).send();
            }
            
          })        
        }
      }
    });
  });
});

// API to delete an attachment by attachment id
router.route('/:note_id/attachments/:attachment_id').delete((request, response) => {

  deleteAttachmentCounter ++;
  var params = {
    MetricData: [
      {
        MetricName: 'api - DELETE /note/:id/attachment/:id',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Unit: 'None',
        Value: deleteAttachmentCounter
      },
    ],
    Namespace: 'DeleteAttachmentApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });

  let note_id = request.params.note_id;
  let attachment_id = request.params.attachment_id;

  validateBasicAuth(request, response , (user_id) =>{
    isUserAuthorized(note_id,user_id,request,response, (isAuth) => {
      if(isAuth == "Authorized"){
        if(currentEnvironment == "dev"){
          db.getAttachmentById(attachment_id, note_id, (data)=>{
            if(data && data.rowCount > 0){
              let fileName = data.rows[0].file_name;
              console.log(fileName);
              s3Upload.deleteObject(request, response, fileName, (data)=>{
                deleteAttachmentInDB(note_id, attachment_id, response);
                
              });
            }
            else{ 
              response.status(400).send();
            }
          });
        }
        if(currentEnvironment == 'default'){
          db.getAttachmentById(attachment_id, note_id, (data)=>{
            if(data && data.rowCount > 0){
              let fileName = data.rows[0].file_name;
              console.log(fileName);
              fs.unlink(uploadFolder+fileName, (error)=>{
                if(error){
                  throw error;
                }
                deleteAttachmentInDB(note_id, attachment_id, response);
              });
            }
          });
        }
      }  
    });
  });
});

// get single attachment by note id and attachment id
router.route('/:note_id/attachments/:attachment_id').get((request, response) => {

  getAttachmentCounter ++;
  var params = {
    MetricData: [
      {
        MetricName: 'api - GET /note/:id/attachments/:id',
        Dimensions: [
          {
            Name: 'api',
            Value: 'counter'
          },
        ],
        Unit: 'None',
        Value: getAttachmentCounter
      },
    ],
    Namespace: 'GetAttachmentApi/traffic'
  };
  cloudWatch.putMetricData(params, (error, data)=>{
    if(error){
      logger.info("Error", error);
    }
    else{
      logger.info("Success", JSON.stringify(data));
    }
  });
    let note_id = request.params.note_id;
    let attachment_id = request.params.attachment_id;

    validateBasicAuth(request, response , (user_id) =>{
        isUserAuthorized(note_id,user_id,request,response, (isAuth) => {
            if(isAuth == "Authorized"){
                getAttachmentByID(note_id, attachment_id, response);
            } 
        });
    });
});

// function to validate basic auth
var validateBasicAuth = (req,res, callback) => {
    let user = basicAuth(req);
    if(!user || !user.name || !user.pass){
        res.set('WWW-Authenticate', 'Basic realm=User not logged in');
        res.status(401).json({response:{
            message: "You are not logged in"
            }
        }).send();
    }
    else{
        db.getUser(user.name, function(data){
            if(data.length <=0){
                //in the database if there are is an item not saved the lenght is 0
                res.status(401).json({response:{
                    message: "Invalid Credentials"
                }}).send();
            }
            else{
                var userPassHash = data[0].password;
                if(bcrypt.compareSync(user.pass, userPassHash)){
                    callback(data[0].id);
                }
                else{
                    res.status(401).json({response:{
                        message: "Invalid Credentials"
                    }});
                }
            }
        });
      }
};

//function to check authorization
var isUserAuthorized = (note_id,user_id,request,res, callback) => {
    db.getNoteById(note_id, function(data){

        if(data.rowCount <= 0){
            res.status(204).send();
        }
        else if(data.rows[0].user_id === user_id ){
            callback("Authorized");
        }
        else{
            res.status(403).json({response:{
                message: "Forbidden!!"
                }
            }).send();
        }

    });
}

// function for insert query
var addDataToDB = (note_id, request, response, attachmentUrl, fileName)=>{
  let attachment_id = uuidv4();
  console.log("DB ka filename " +fileName);
  db.addAttachment(note_id,attachment_id,attachmentUrl, fileName, (result)=>{

      db.getAttachmentById(attachment_id,note_id, function(data){
          if(data.rowCount <= 0){
              response.status(204).send();
          }
          else{
              response.status(201).json(data.rows).send();
              logger.info("Attachment added successfully to database");
          }
      });
  });
}

// function for update query
var updateDataInDB = (note_id, attachment_id, request, response, attachmentUrl, fileName) =>{
  db.updateAttachment(note_id,attachment_id,attachmentUrl, fileName, (result)=>{
    if(result.rowCount <= 0){
      response.status(204).send();
    }
    else{
      db.getAttachmentById(attachment_id,note_id, function(data){
        if(data.rowCount <= 0){
          response.status(204).send();
        }
        else{
          response.status(200).json(data.rows).send();
          logger.info("Attachment update successful to database");
        }
      });
    }
  });
}

// function to get all rows for an id
var getAllAttachments = (note_id, response) => {
  db.getAllAttachments(note_id, function(data){
    if(data.rowCount <= 0){
        response.status(204).send();
    }
    else{
        response.status(200).json(data.rows).send();
    }
});
}

var deleteAttachmentInDB = (note_id, attachment_id, response)=>{
  db.deleteAttachment(note_id,attachment_id,(result)=>{
    if(result.rowCount <= 0){
        response.status(400).send();
        logger.info("Attachment deletion successful");
    }
    else{
        response.status(204).send();
    }
});
}

var getAttachmentByID = (note_id, attachment_id, response) => {
  db.getAttachmentById(attachment_id,note_id, function(data){
    if(data.rowCount <= 0){
        response.status(404).send();
    }
    else{
      console.log(data.rows);
        response.status(200).json(data.rows).send();
    }
  });
}
