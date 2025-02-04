
// // DeukSpineVirtualAssistant
// const {SessionsClient} = require('@google-cloud/dialogflow-cx');
// const uuid = require('uuid');
// const express = require('express');
// const bodyParser = require('body-parser');
// const locationId = 'us-central1';
// const agentId = '4a392212-fd9e-49c7-b837-3869765711ac';
// const projectId = 'integral-kiln-396613';
// const languageCode = 'en';

// DsBot
const {SessionsClient} = require('@google-cloud/dialogflow-cx');
const uuid = require('uuid');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const locationId = 'us-central1';
const agentId = '080264fd-03a7-4a10-922c-03a668bf9e27';
const projectId = 'integral-kiln-396613';
const languageCode = 'en';

// List of objects
data = []
let request_stamp = Date.now();
let response_stamp = Date.now();

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

// Function to dynamically add a new object
function addNewEntry(newEntry) {

  // path to the file
  filePath = './output.json';

  // Add the new object to the data array
  data.push(newEntry);

  // Convert the updated array to a JSON string
  const jsonData = JSON.stringify(data, null, 2);

  // Write the updated JSON data to the file
  fs.writeFile(filePath, jsonData, 'utf8', (err) => {
      if (err) {
          console.error("Error writing to file:", err);
          return;
      }
      console.log("JSON file updated successfully!");
  });
} 

async function runSample(msg=null, event=null) {

  request_stamp = Date.now();
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

  // Defining a structure for data collection
  object = {
  question : '',
  retrieval_context : '',
  confidence :'',
  actual_output:'',
  expected_output: ''
 }
 
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
  const payload = response.queryResult.responseMessages
  
  console.log("Question:")
  console.log(msg)
  console.log("Answer:")
  console.log(payload)

  object.question = msg;
  try {
  if (payload[1].payload.fields?.data) { 
  object.actual_output = payload[1].payload.fields.data.listValue.values[0].structValue.fields.value['stringValue']
  object.confidence = payload[1].payload.fields.data.listValue.values[0].structValue.fields.RAG_Score['stringValue']
  object.retrieval_context = JSON.parse(payload[1].payload.fields.data.listValue.values[0].structValue.fields.context['stringValue']).snippet;
  }
}
catch (error){
  console.log(error)
}
  addNewEntry(object)
  

  // const allText = payload['text']['listValue']['values'];
  // console.log(typeof allText)
  // console.log(`Agent Response: ${allText}`);
  //   for (const message of allText) {
  //     if (message) {
  //       console.log(message['stringValue']);
  //     }
      
  //   }
  //   if (response.queryResult.match.intent) {
  //     console.log(
  //       `Matched Intent: ${response.queryResult.match.intent.displayName}`
  //     );
  //   }
  //   console.log(
  //     `Current Page: ${response.queryResult.currentPage.displayName}`
  //   );
    response_stamp = Date.now();

    return payload;
}

app.listen(port,()=>{
  
  setInterval(() => {
    let difference = (Date.now()-response_stamp)/1000;
    console.log(`Time Difference between the last request and response: ${difference}`);
    if (difference > 10){
      console.log("No response received...")
      runSample(msg= null, event="sys.no-match-default")
      response_stamp = Date.now();
     }
}, 2000); // Print every 2 seconds
  
  console.log("running on port "+port)

})