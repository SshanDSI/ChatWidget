// const WebSocket = require('ws'); 
var $messages = $('.messages-content'); //jquery format to get the element into a variable
var VEvent="Message"; // flag for video events 
var dizText = document.getElementById('MSG')
const socket = new WebSocket('ws://localhost:5000/send-msg')
let promiseChain = Promise.resolve();
var myVideo; // Making this a global variable to ensure accessibility
var response_chatAPI = null;
var response_User = null;
const maxcount = 1;
var count=0;

// Handler when the socket connection is established
socket.onopen = () => {
    console.log("Connected to WebSocket Server");

// Let's send a message to the server once the connection is established
data = new URLSearchParams()
data.append('MSG','Hello from Sanjay')
socket.send(data)
}

$(window).load(function() {
  var dizText = document.getElementById('MSG')
  $messages.mCustomScrollbar({theme : "light-thick"});

// Events on the chatUI

// Detects when a submit is made by the user
document.getElementById("mymsg").onsubmit = (e)=>{
  e.preventDefault() 
  insertMessage($('.message-input').val());
  console.log('A message was submitted ....');
}

// detects when a click is made on a button
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('chat-buttons')) {
      const buttonText = event.target.innerText || event.target.textContent;
      insertMessage(buttonText);
  }
});

function updateScrollbar() {
  $messages.mCustomScrollbar("update");
}

function DownScroll() {
  $messages.mCustomScrollbar('scrollTo', 586.8, {
    scrollInertia: 100,
    timeout: 0,
    moveDragger:true
  });
}

async function sendtoServer() {
  data = new URLSearchParams();
      
  switch (VEvent){
    case "Complete":
      var formdata = new FormData();
      formdata.set('EVENT','VideoComplete');
      for (const pair of formdata) {
        data.append(pair[0], pair[1]);
        console.log(pair)
        console.log(data)
      }
      VEvent="Message";
      break;
    case "Message":
      for (const pair of new FormData(document.getElementById("mymsg"))) {
        data.append(pair[0], pair[1]);
        console.log(pair)
        console.log(data)
      }
      break
    case "Paused":
      var formdata = new FormData();
      formdata.set('EVENT','VideoPaused');
      for (const pair of formdata) {
        data.append(pair[0], pair[1]);
        console.log(pair)
        console.log(data)
      }
      VEvent="Message";
      break;
    }
  
  response_User = Date.now()
  socket.send(data)
      
}

function insertMessage(msg,send2Server=true,end=false) {
  // msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return false;
  }

  if (end){
    console.log("Formatted for End of Conversation")
    $('<div class="end-session">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
  }
  else{
    console.log("Formatted for Regular Conversation")
  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
}
  if (send2Server){
    console.log("Sent to Chat Server")
    sendtoServer()
  }
  
  
  $('.message-input').val(null);
  updateScrollbar();
  DownScroll();
  VEvent="Message";
}

// Function called when the YouTube Player API is ready (promise functionality for a sequential execution)
function onYouTubeIframeAPIReady_promise(videoId) {
  return new Promise((resolve) => {
      setTimeout(() => {
      // regular function code
      const date = new Date();
      const min = date.getMinutes()
      const sec = date.getSeconds()
      var ran_id = min.toString() + sec.toString(); 
      $('<div class="message new" id="Video-'+ ran_id + '"><figure class="avatar"><img src="css/DSI.jpg" /></figure></div>').appendTo($('.mCSB_container')).addClass('new');
      myVideo = new YT.Player('Video-'+ ran_id, {
      width:'640',
      height : '360',
      videoId : videoId,
      playerVars:{
      autoplay : 1,
      controls : 1,
      enablejsapi:1,
      playsinline: 1,
      rel :0,
      },
      events: {
      'onReady':onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError':onPlayerError,
      }
      } ,
      console.log('Youtube IFrame API Ready....')
      );

      updateScrollbar();
      DownScroll();
      resolve(); // Resolve after the task is complete
    },1000);
  });
}

// Function called when the player is ready to be played
function onPlayerReady(event) {
  console.log("Video is ready to be played... Transition to Video mode.. ");
}

// Function called when there is a video player error
function onPlayerError(event) {
  console.log("Error Occured... "+ event);
}

// Function called when the player's state changes
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    console.log("Video has Completed... Prompt the user.. ");
    VEvent="Complete";
    myVideo = null;
    sendtoServer();
  }
  else if (event.data === YT.PlayerState.PAUSED) {
    console.log("Video has been Paused... Prompt the user.. ");
    VEvent="Paused";
    sendtoServer();
  }
  else{
    console.log("Please check for other issues... with the video")
  }
  
}

// To print out the data from chatbot using the promise functionality for sequential execution
function serverMessage_promise(response2) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if ($('.message-input').val() != '') {
        return false;
      }
      const Element = $(response2);
      if (Element.is(':button')) {
        $('<div class="message new">' + response2 + '</div>').appendTo($('.mCSB_container')).addClass('new');
      }
      else{
      $('<div class="message new"><figure class="avatar"><img src="css/DSI.jpg" /></figure>' + response2 + '</div>').appendTo($('.mCSB_container')).addClass('new');
      }
      updateScrollbar();
      DownScroll();
      resolve();
    }, 1000);
    }) 
}

// Event handler for when the client receives a message from the server
// It includes handlers for various data types
socket.onmessage = (event) => {
    try {
        response_chatAPI = Date.now()
        const data = JSON.parse(event.data);
        for (let k=0; k<data.length; k++) {
          if (data[k].payload.fields?.data) { 
          for (let i=0; i< data[k].payload.fields.data.listValue.values.length; i++) {
            // Video specific Condition
            promiseChain = promiseChain.then(() => {
              if (data[k].payload.fields.data.listValue.values[i].structValue.fields.type['stringValue'] == 'video'){
                return onYouTubeIframeAPIReady_promise(data[k].payload.fields.data.listValue.values[i].structValue.fields.value['stringValue']);
              }
              else if (data[k].payload.fields.data.listValue.values[i].structValue.fields.type['stringValue'] == 'RAG'){
                console.log("You are in the Datastore condition")
                if (data[k].payload.fields.data.listValue.values[i].structValue.fields.RAG_Score['stringValue'] == 'HIGH' || data[k].payload.fields.data.listValue.values[i].structValue.fields.RAG_Score['stringValue'] == 'VERY_HIGH'){
                  return serverMessage_promise(data[k].payload.fields.data.listValue.values[i].structValue.fields.value['stringValue']);
                }
                else{
                  return serverMessage_promise("<p> Sorry.. I did not understand that. Can you please rephrase the question for me ?</p>");
                }
              }
              else{
                return serverMessage_promise(data[k].payload.fields.data.listValue.values[i].structValue.fields.value['stringValue']);
              }
            });
        }
      } 
    }
        
    } catch (error){
        console.error('Invalid JSON:', event.data);
        console.log(error)
    }
  };

// Silence Detection
const interval = setInterval(() => {
  if (response_User === null){
    response_User = Date.now()
  }
  let difference = (Date.now()-response_User)/1000;
  console.log(`Time Difference between the last request and response: ${difference}`);
  if (difference > 10){

    if (myVideo instanceof YT.Player){
      if (myVideo.getPlayerState()===1){
        // Skip when the video is being played..
      }
    } 
    else{
      // If the video isn't playing and the user hasn't responded, send an alert to the user.
      console.log("No response received... Text Condition")
      sendtoServer(" ").then(() => {
      count++;
        if (count>maxcount) {
          clearInterval(interval)
          console.log("Interval Cleared...")
          insertMessage("-------------------------------End of Conversation-------------------------------",false,true)
        }
        console.log(count)
      })
      
      
    }

   }
}, 2000); // Check every 2 seconds


// Event handler for when there is an error with the WebSocket connection
socket.onerror = (error) => {
    console.error('WebSocket error: ', error);
  };

// Event handler for when the WebSocket connection is closed
socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
  };

})