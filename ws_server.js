// DeukSpineVirtualAssistant
const {SessionsClient} = require('@google-cloud/dialogflow-cx');
const uuid = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');
const locationId = 'us-central1';
const agentId = '4a392212-fd9e-49c7-b837-3869765711ac';
const projectId = 'integral-kiln-396613';
const languageCode = 'en';
const logger = require("./logger")

// // DialogFlow Parameters
// const {SessionsClient} = require('@google-cloud/dialogflow-cx');
// const uuid = require('uuid');
// const fs = require('fs');
// const express = require('express');
const WebSocket = require('ws');
// const bodyParser = require('body-parser');
// const locationId = 'us-central1';
// const agentId = '080264fd-03a7-4a10-922c-03a668bf9e27';
// const projectId = 'integral-kiln-396613';
// const languageCode = 'en';
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'C:/Users/Sshanbhag/Documents/ChatWidget/integral-kiln-396613-6124bf80968e.json';

const app = express();
const port = 5000;
const sessionId =  uuid.v4(); //if this line of code for creating sessionID keeps getting called every call then the context of the flow will disappear
app.use(bodyParser.urlencoded({extended:false}))

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    // Pass to next layer of middleware
    next();
  });

// Set up WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Functionality upon the connection with the client
wss.on('connection', (ws) => {
    logger.info('Client connected',{sessionID : sessionId});

    // Handling messages from the client 
    ws.on('message',(message) => {
        const params = new URLSearchParams(message.toString());
        logger.debug(`Received Message: ${params.get('MSG')}`, {sessionID : sessionId});
        logger.debug(`Received Event: ${params.get('EVENT')}`, {sessionID : sessionId});
        // The promise must resolve before sending the data to the socketClient
        chatAPI(params.get('MSG'),params.get('EVENT')).then((response) => {
            logger.debug(`String Message Before Sending to the client - ${JSON.stringify(response)}`, {sessionID : sessionId})
            ws.send(JSON.stringify(response))
        })
    }) 

    //handling what to do when the client disconnects from the server
    ws.on('close', () => {
        logger.info("Client disconnected from the server", {sessionID : sessionId})
    })

    //handling client connection error
    ws.onerror =function (error) {
        logger.info(`Some error occured ${error}`, {sessionID : sessionId})
    }

});

async function chatAPI(msg=null, event=null) {

  // Create a new session
  var df_request_start_time = process.hrtime.bigint()
  const client = new SessionsClient({apiEndpoint: 'us-central1-dialogflow.googleapis.com'});
  const sessionPath = client.projectLocationAgentSessionPath(projectId, locationId, agentId, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      languageCode,
    },
  };
 
  // The text query request.
  if (event == null ) {
    request['queryInput']['text']={};
    request['queryInput']['text']['text']=msg;
  }
    
  else {
    request['queryInput']['event']={};
    request['queryInput']['event']['event']=event;
  }
  
  // Send request and log result
  var df_intent_detect_start_time = process.hrtime.bigint()
  const [response] = await client.detectIntent(request);
  var df_intent_detect_end_time = process.hrtime.bigint()
  var df_request_end_time = process.hrtime.bigint()

  logger.info(`DialogFlow Request Time : ${(df_request_end_time-df_request_start_time)/BigInt(10 ** 6)} ms`, {sessionID : sessionId})
  logger.info(`Intent Detect Time : ${(df_intent_detect_end_time-df_intent_detect_start_time)/BigInt(10 ** 6)} ms`, {sessionID : sessionId})

  const payload = response.queryResult.responseMessages
  return payload;
}

// This is the http server where Express will listen
const server = app.listen(port, () => {
    logger.info(`Server started on port ${port}`,{sessionID : sessionId});
    
  });

server.on('upgrade', (request, socket, head) => {
    if (request.url === '/send-msg') {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
} else {
    socket.destroy(); // Reject if not matching route
}
});