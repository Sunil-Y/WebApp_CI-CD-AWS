const envVars = require('dotenv').config({path: '../../var/.env'});
//creates a new server
const http = require('http');
const app = require('./app');

if(envVars.error){
  throw envVars.error
}
console.log(envVars.parsed);

const port = process.env.PORT 
const server = http.createServer(app);
server.listen(port);
console.log('Server is running on PORT:', (port));