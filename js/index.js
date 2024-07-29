var $messages = $('.messages-content'); //jquery format to get the element into a variable
var VEvent="Message"; // flag for video events 
var dizText = document.getElementById('MSG')

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



  function insertMessage() {
    msg = $('.message-input').val();
    if ($.trim(msg) == '') {
      return false;
    }
    $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
    fetchmsg() 
    
    $('.message-input').val(null);
    updateScrollbar();
    DownScroll();
    VEvent="Message";

  }

  // detects when a submit is made
  document.getElementById("mymsg").onsubmit = (e)=>{
    e.preventDefault() 
    insertMessage();
    console.log('A message was submitted ....');


    // serverMessage("hello");
    // speechSynthesis.speak( new SpeechSynthesisUtterance("hello"))
  }

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
      fetchmsg();
    }
    else if (event.data === YT.PlayerState.PAUSED) {
      console.log("Video has been Paused... Prompt the user.. ");
      VEvent="Paused";
      fetchmsg();
    }
    else{
      console.log("Please check for other issues... with the video")
    }
    
  }

  function serverMessage(response2) {
    if ($('.message-input').val() != '') {
      return false;
    }
    // $('.message.loading').remove();
    $('<div class="message new"><figure class="avatar"><img src="css/DSI.jpg" /></figure>' + response2 + '</div>').appendTo($('.mCSB_container')).addClass('new');
    updateScrollbar();
    DownScroll();

    //Disable Text box on Response
    // dizText.disabled=true;
    // console.log("Text Box Disabled   " + dizText.disabled)
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
      
    console.log("abc",data)
      fetch(url, {
        method: 'POST',
        body:data
      }).then(res => res.json())
      .then(response => {
          for (let i=0; i< response.Reply['totalEle'].numberValue; i++) {
            // Video specific Condition
            if (response.Reply['youtubeVideoID'].stringValue !== "" && response.Reply['VideoPos'].numberValue !== -1 && i == response.Reply['VideoPos'].numberValue) {
                setTimeout(function() {
                  onYouTubeIframeAPIReady(response.Reply['youtubeVideoID'].stringValue);
                }, i * 550 * response.Reply['totalEle'].numberValue);
            }
            // Message Specific Condition
            else{
            setTimeout(function() {
              serverMessage(response.Reply.text.listValue.values[i]['stringValue']);
            }, i* 550 * response.Reply['totalEle'].numberValue);
          }
        }
      
      })
        .catch(error => console.error('Error h:', error));

  }

  dizText.disabled=false;
    console.log("Text Box Enabled again   " + dizText.disabled)

})
