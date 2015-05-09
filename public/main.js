var text; // variable for the text div 
var latestdata;
var toSend;
var heartRate;
var message;
var normal = new Audio('../audio/heartbeat.mp3');
var fast = new Audio('../audio/fast-heartbeat.mp3');
var single = new Audio('../audio/single-hb.mp3');
single.loop = true;
var question;

$("#box").bind("DOMSubtreeModified",function() {  
  $("#box").animate({
      scrollTop: $("#box")[0].scrollHeight
    });
});

var socket = io.connect();
socket.on('bpm-update', function(data){

  console.log("received bpm-update: "+JSON.stringify(data));
});

  socket.on('bpm-update', function(toSend){

  $('#pulse-rate-value').html("Chat partner BPM: " +toSend.bpm);
  $('#pulse-rate-meta-data').html("Meta data: " +toSend.msg);
  //play audio when heartRate is higher than 100
  if (toSend.bpm > 80) {
    single.playBackRate = 2.0;
    single.play();
    $('#dot').css("background-color", "#FFCCCC");
    console.log("dont think this works");
  }
  //pause audio when heartRate is lower than 100
  if (toSend.bpm < 80) {
    single.playBackRate = 0.5;
    single.play();
    $('#dot').css("background-color", "#8B2323");
    console.log("HR below 100");
  }
});

socket.on('why', function(queCrit){
  console.log("CHECK IT"+queCrit.question);
  // $('#que-box').html(queCrit.question);
  $('#m').val(queCrit.question);
});

socket.on('other client', function(data){
  console.log(data);
  $('#pulse-rate-value').html('BPM: '+data);
    if (data > 80) {
    single.playBackRate = 2.0;
    single.play();
    $('#dot').css("background-color", "#FFCCCC");
    console.log("HR above 100");
  }
  //pause audio when heartRate is lower than 100
  if (data < 80) {
    single.playBackRate = 0.5;
    single.play();
    $('#dot').css("background-color", "#8B2323");
    console.log("dont think this works");

  }
});
