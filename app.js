
const {SessionsClient} = require('@google-cloud/dialogflow-cx');
const uuid = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');
const locationId = 'us-central1';
const agentId = '4a392212-fd9e-49c7-b837-3869765711ac';
const projectId = 'integral-kiln-396613';
const languageCode = 'en';

//setting an environment variable to access the key file
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'C:/Users/Sshanbhag/Documents/ChatWidget/integral-kiln-396613-6124bf80968e.json';

// Making Dialogflow dynamic
const app = express();
const port =5000;
const sessionId =  uuid.v4(); //if this line of code for creating sessionID keeps getting called every call then the context of the flow will disappear

app.use(bodyParser.urlencoded({extended:false}))

//cors code 
app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.post('/send-msg',(req,res)=>{runSample(req.body.MSG, req.body.EVENT).then(data=>{res.send({Reply:data})})})




 // @param {string} projectId 'integral-kiln-396613'

async function runSample(msg=null, event=null) {

  // Create a new session
  console.time('Dialogflow Request Time');
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
  console.time("Intent Detect Time");
  const [response] = await client.detectIntent(request);
  console.timeEnd("Intent Detect Time");
  console.timeEnd('Dialogflow Request Time');
  const payload = response.queryResult.responseMessages[0].payload.fields;
  console.log(payload['text']['listValue']['values'])
  console.log(payload['youtubeVideoID'].stringValue)
  console.log(payload['VideoPos'].numberValue)
  console.log(payload['totalEle'].numberValue)
  const allText = payload['text']['listValue']['values'];
  console.log(typeof allText)
  console.log(`Agent Response: ${allText}`);
    for (const message of allText) {
      if (message) {
        console.log(message['stringValue']);
      }
      
    }
    if (response.queryResult.match.intent) {
      console.log(
        `Matched Intent: ${response.queryResult.match.intent.displayName}`
      );
    }
    console.log(
      `Current Page: ${response.queryResult.currentPage.displayName}`
    );
  
    return payload;
}

app.listen(port,()=>{console.log("running on port "+port)})