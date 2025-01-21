var $messages = $('.messages-content'); //jquery format to get the element into a variable
var VEvent="Message"; // flag for video events 
var dizText = document.getElementById('MSG')
let promiseChain = Promise.resolve();



//speech recognition 
// This is a try catch to setup the speech recognition
try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
}

// Event Listerner for voice Recognition
$('#start-record-btn').on('click', function(e) {
  recognition.start();
});

// this one's for transcribing the speech - speech to text
recognition.onresult = (event) => {
  const speechToText = event.results[0][0].transcript;
 document.getElementById("MSG").value= speechToText;
  //console.log(speechToText)
  insertMessage()
}

// This is a window load message
// Window is nothing but the entire HTML Structure.
// The fucntions within it will run upon completion
$(window).load(function() {
  var dizText = document.getElementById('MSG')
  $messages.mCustomScrollbar({theme : "light-thick"});
  // setTimeout(function() {
  //   serverMessage("Hello this is Sanjay !! \n Your Virtual Assistant");
  // }, 100);

// });

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



  function insertMessage(msg) {
    // msg = $('.message-input').val();
    if ($.trim(msg) == '') {
      return false;
    }

    $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
    fetchmsg_promise() 
    
    $('.message-input').val(null);
    updateScrollbar();
    DownScroll();
    VEvent="Message";
  }

  // detects when a submit is made
  document.getElementById("mymsg").onsubmit = (e)=>{
    e.preventDefault() 
    insertMessage($('.message-input').val());
    console.log('A message was submitted ....');


    // serverMessage("hello");
    // speechSynthesis.speak( new SpeechSynthesisUtterance("hello"))
  }

  // detects when a click is made on a button
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('chat-buttons')) {
        const buttonText = event.target.innerText || event.target.textContent;
        insertMessage(buttonText);
    }
});

  // Function called when the YouTube Player API is ready
  function onYouTubeIframeAPIReady(videoId) {
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
    } ,console.log('Youtube IFrame API Ready....')
  );

    updateScrollbar();
    DownScroll();
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
    } ,console.log('Youtube IFrame API Ready....')
  );

    updateScrollbar();
    DownScroll();
    resolve(); // Resolve after the task is complete
      },1000);
    });
  }

  function onPlayerReady(event) {
    console.log("Video is ready to be played... Transition to Video mode.. ");
  }

  function onPlayerError(event) {
    console.log("Error Occured... "+ event);
  }

  // Function called when the player's state changes
  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
      console.log("Video has Completed... Prompt the user.. ");
      VEvent="Complete";
      fetchmsg_promise();
    }
    else if (event.data === YT.PlayerState.PAUSED) {
      console.log("Video has been Paused... Prompt the user.. ");
      VEvent="Paused";
      fetchmsg_promise();
    }
    else{
      console.log("Please check for other issues... with the video")
    }
    
  }

  function serverMessage(response2) {
    promiseChain = promiseChain.then(() => {
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
      })
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


  function fetchmsg(){

    var url = 'http://localhost:5000/send-msg';
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
      
    let adj=0
    console.log("abc",data)
      fetch(url, {
        method: 'POST',
        body:data
      }).then(res => res.json())
      .then(response => {
        console.log(response.Reply)
        for (let k=0; k<response.Reply.length; k++) {
          // console.log(response.Reply[k].payload.fields.text.listValue.values[k]['stringValue'])
          if (response.Reply[k].payload.fields?.text) { 
            if (response.Reply[k].payload.fields['VideoPos'].numberValue !== -1){
              adj = 1;
            }
          for (let i=0; i< adj + response.Reply[k].payload.fields.text.listValue.values.length; i++) {
            // Video specific Condition
            console.log(response.Reply[k].payload.fields['youtubeVideoID'].stringValue)
            if (response.Reply[k].payload.fields['youtubeVideoID'].stringValue !== "" && response.Reply[k].payload.fields['VideoPos'].numberValue !== -1 && i == response.Reply[k].payload.fields['VideoPos'].numberValue) {
                setTimeout(function() {
                  onYouTubeIframeAPIReady(response.Reply[k].payload.fields['youtubeVideoID'].stringValue);;
                }, (k+1)*(i+1) * 100* response.Reply[k].payload.fields.text.listValue.values.length);
            }
            // Message Specific Condition
            else{
              serverMessage(response.Reply[k].payload.fields.text.listValue.values[i]['stringValue']);
          }
        }
      } 
    }
      })
        .catch(error => console.error('Error h:', error));

  }

  function fetchmsg_promise(){

    var url = 'http://localhost:5000/send-msg';
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
      
    let adj=0
    console.log("abc",data)
      fetch(url, {
        method: 'POST',
        body:data
      }).then(res => res.json())
      .then(response => {
        console.log(response.Reply)
        for (let k=0; k<response.Reply.length; k++) {
          // console.log(response.Reply[k].payload.fields.text.listValue.values[k]['stringValue'])
          if (response.Reply[k].payload.fields?.text) { 
            if (response.Reply[k].payload.fields['VideoPos'].numberValue !== -1){
              adj = 1;
            }
          for (let i=0; i< adj + response.Reply[k].payload.fields.text.listValue.values.length; i++) {
            // Video specific Condition
            console.log(response.Reply[k].payload.fields['youtubeVideoID'].stringValue)
            if (response.Reply[k].payload.fields['youtubeVideoID'].stringValue !== "" && response.Reply[k].payload.fields['VideoPos'].numberValue !== -1 && i == response.Reply[k].payload.fields['VideoPos'].numberValue) {
                setTimeout(function() {
                  onYouTubeIframeAPIReady(response.Reply[k].payload.fields['youtubeVideoID'].stringValue);;
                }, (k+1)*(i+1) * 100* response.Reply[k].payload.fields.text.listValue.values.length);
            }
            // Message Specific Condition
            else{
              serverMessage(response.Reply[k].payload.fields.text.listValue.values[i]['stringValue']);
          }
        }
      } 
    }
      })
        .catch(error => console.error('Error h:', error));

  }

  dizText.disabled=false;
    console.log("Text Box Enabled again   " + dizText.disabled)

})
