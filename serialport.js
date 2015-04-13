var io = require('socket.io')(server);
var express = require('express');
var colors = require('colors');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 8080;
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/cu.usbmodem1411", {
  baudrate: 57600
});
var latestData = 0;
var heartRate;
var message;

app.use('/', express.static(__dirname + '/public'));

server.listen(port, function() {
    console.log('Server running at port:' + port);
});

serialPort.on('open', showPortOpen);
serialPort.on('data', saveLatestData);
serialPort.on('close', showPortClose);
serialPort.on('error', showError);

function showPortOpen() {
   console.log('port open. Data rate: ' + serialPort.options.baudRate);
}
 
function showPortClose() {
   console.log('port closed.');
}
 
function showError(error) {
   console.log('Serial port error: ' + error);
}

function saveLatestData(data) {

  var rawData = data.toString();
  // console.log("rawData: "+rawData);
  if(rawData.indexOf("B") == 0){
    var bpm = rawData.split("B")[1];
    //if bpm index of the escape character is equal -1 then set splitter to 2, else set it to bmp 
    var splitter = bpm.indexOf("\r") == -1 ? 2 : bpm.indexOf("\r");
    // console.log("escape index: ".cyan+bpm.indexOf("\r"));
    heartRate = bpm.substring(0, splitter);
    message = '';
    if (heartRate > 100) message = "You are a little excited";
    if (heartRate < 50)  message = "Breathe a little";
    latestData = heartRate;
    var toSend = {
      "bpm": heartRate,
      "msg": message
    }
    console.log("sending: ".white+ JSON.stringify(toSend,null,'\t'));
    io.emit('bpm-update', toSend);
  }
}

io.on('connection', function(socket){
  socket.on('bpm-update', function(data){
  });
});

function sendData(request) {

  request.respond(latestData);

}