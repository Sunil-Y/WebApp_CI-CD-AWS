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

//configuration for postgres
const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
})

var getUser = (email, callback) => {
  createTables((error, result)=>{
  if(error){
  console.log(error);
  throw error;
  }
  else{
    pool.query("SELECT * FROM users where email= '"+email+"' ORDER BY id ASC", (error, results) => {
      if (error) {
          console.log(error);
          throw error
      }
      else{
          console.log("In queries");
          callback(results.rows);
      }  
    })
  }
});
}

var createUser = (email, passwordHash, callback) => {

  createTables((error, result)=>{
    if(error){
      console.log(error);
      throw error;
      logger.error("Tables creation failed");

    }
    else{
      pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, passwordHash], (error, result) => {
        if (error) {
          console.log(error);
          callback(false);
        }
        else{
          callback(true);
        }
      });
    }
  });  
}

// get all notes of userId
var getAllNotes = (userId,callback) => {

    pool.query("SELECT * FROM notes where user_id = "+userId+" ORDER BY id ASC", (error, results) => {
        if (error) {
            throw error
        }
        else{
            callback(results);
        }
        
    });
}

//get Single note 
var getSingleNote = (userId,id,callback) => {
    pool.query("SELECT * from notes where user_id='"+userId+"' and id='"+id+"'", (error, result) => {
        if(error){
            throw error
        }
        else{
            callback(result);
        }
    });
}

// delete a note
var deleteNote = (userId,id,callback) => {
    pool.query("delete from notes where user_id ='"+userId+"' and id='"+id+"'", (error, result) => {
        if(error){
            throw error
            logger.error(error);
        }
        else{
            callback(result);
        }
    });
};
var createNotes = (id, title, content, user_id, callback) => {
    
    pool.query(`CREATE TABLE IF NOT EXISTS notes (id VARCHAR(200) NOT NULL, title VARCHAR(50) NOT NULL, content VARCHAR(50) NOT NULL, user_id INT NOT NULL, 
                                      created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, 
                                      last_updated_on TIMESTAMP)`, (error, results)=>{
        pool.query(`CREATE TABLE IF NOT EXISTS attachments(id VARCHAR(200) NOT NULL,
              url varchar(200),
              note_id VARCHAR(200) NOT NULL,
              file_name VARCHAR(200));`, (error, results)=>{
            if(error){
                console.log(error);
                throw error;
                logger.error(error);
            }
            else {
                pool.query('INSERT INTO notes (id, title, content, user_id) VALUES ($1 ,$2 ,$3 , $4) ', [id, title, content, user_id], (error, results) => {
                    if (error) {
                        throw error
                        logger.error(error);
                    } else {
                        pool.query('SELECT * FROM notes where id = $1', [id], (error, results) => {
                            //console.log(results.rows);
                            callback(results.rows);
                        });
                    }
                });
            }
      });
    })
}

var updateNote = (id, title, content, user_id, callback) => {

  pool.query(`UPDATE notes 
              SET title=($1),
                  content=($2),
                  last_updated_on= NOW()
              WHERE id=($3) 
              AND user_id=($4)`, 
              [title, content, id, user_id], (error, result) => {
    if (error) {
      throw error; 
      logger.info(error);
    }
    else {
      pool.query('SELECT * FROM notes where id = $1 AND user_id = $2', [id,user_id], (error, results) => {
        callback(results.rows);
      });
    }
  });
}

var getNoteById = (id,callback) => {
    pool.query("SELECT * from notes where  id='"+id+"'", (error, result) => {
        if(error){
            throw error
        }
        else{
            callback(result);
        }
    });
}

// funtion to store attachment information
var addAttachment = (note_id, attachment_id, attachment_url, file_name, callback) => {
  console.log(attachment_url);
  console.log(file_name);
  pool.query(`CREATE TABLE IF NOT EXISTS attachments(id VARCHAR(200) NOT NULL,
              url varchar(200),
              note_id VARCHAR(200) NOT NULL,
              file_name VARCHAR(200));`, (error, results)=>{
  
  if(error){
    console.log(error);
    throw error;
    logger.error(error);
  }
  else{
    pool.query('INSERT INTO attachments (id, url, note_id, file_name) VALUES($1, $2, $3, $4)' , [attachment_id,attachment_url, note_id, file_name], (error,result) => {
      if(error){
        console.log(error);
        throw error
        logger.error("Attachment insertion in database failed");
      }
      else{
        callback(result);
      }
    });
  }
  });  
}

// get attachment by attachment id
var getAttachmentById = (attachment_id,note_id,callback) => {
    pool.query("SELECT * from attachments where  id='"+attachment_id+"' AND note_id ='" +note_id +"'", (error, result) => {
        if(error){
            throw error
        }
        else{
            callback(result);
        }
    });
}

var getAllAttachments = (note_id,callback) => {
  pool.query(`CREATE TABLE IF NOT EXISTS attachments(id VARCHAR(200) NOT NULL,
            url varchar(200),
            note_id VARCHAR(200) NOT NULL,
            file_name VARCHAR(200));`, (error, results)=>{

              pool.query("SELECT * from attachments where  note_id='"+note_id+"'", (error, result) => {
                  if(error){
                      throw error
                  }
                  else{
                      callback(result);
                  }
              });

            });
}

// update attachments
var updateAttachment = (note_id, attachment_id, url, fileName, callback) =>{
    pool.query("UPDATE attachments SET url = $1, file_name = $4 WHERE id = $2 AND note_id = $3",[url,attachment_id,note_id, fileName],
     (error, results) => {
         if(error)
         {
             throw error;
             logger.error(error);
         }
         else{
            callback(results);
         }
        
      });
}

// Delete Attachment
var deleteAttachment = (note_id, attachment_id, callback) =>{
    pool.query("DELETE FROM attachments WHERE id = $1 AND note_id = $2",[attachment_id,note_id],
     (error, results) => {
         if(error)
         {
             throw error;
             logger.error(error);
         }
         else{
            callback(results);
         }
        
      });
}

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


module.exports = {
    getUser,
    createUser,
    getAllNotes,
    updateNote,
    deleteNote,
    getSingleNote,
    createNotes,
    getNoteById,

    // Attachmets section
    addAttachment,
    getAttachmentById,
    getAllAttachments,
    updateAttachment,
    deleteAttachment
}