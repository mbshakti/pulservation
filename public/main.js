var socket = io.connect();
var text; // variable for the text div 
var latestdata;
var toSend;
var heartRate;
var message;
var audio = new Audio('../audio/heartbeat.mp3');
 
//p5 stuff
function setup() {

}
 
function draw() {

}


socket.on('bpm-update', function(data){

  console.log("received bpm-update: "+JSON.stringify(data));
});

  socket.on('bpm-update', function(toSend){

  $('#pulse-rate-value').html("Current heart rate is: " +toSend.bpm);
  $('#pulse-rate-meta-data').html("Meta data: " +toSend.msg);
  //play audio when heartRate is higher than 100
  if (toSend.bpm > 100) {
    audio.play();
    console.log("dont think this works");
  }
  //pause audio when heartRate is lower than 100
  if (toSend.bpm < 100) {
    audio.pause();
    console.log("dont think this works");
  }
});
