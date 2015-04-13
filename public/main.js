var text; // variable for the text div 
var latestdata;
var toSend;
var heartRate;
var message;
 
function setup() {
	// make a new div 
  // text = createDiv();
  // make a HTTP call to the server for the data:
  //showData is a callback function which is described below
  // var sensorReading = loadStrings("/", showData);
  // console.log("setup"+ data);
}
 
function draw() {
  // ellipse(50, 50, 80, 80);
  // console.log(result);

}

// function showData(result) {
   // when the server returns, show the result in the div:
   // text.html("Pulse rate reading:" + result);
   // make another HTTP call:
   // var sensorReading = loadStrings("/", showData);
// }


  var socket = io.connect();

  socket.on('bpm-update', function(data){

    console.log("received bpm-update: "+JSON.stringify(data));
  });

    socket.on('bpm-update', function(toSend){

    console.log("is this working?: "+toSend.bpm);
    $('#text').html("Current heart rate is: " +toSend.bpm);
  });
