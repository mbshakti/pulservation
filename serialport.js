var io = require('socket.io')(server);
var express = require('express');
var colors = require('colors');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 8080;
var fs = require('fs');
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/cu.usbmodem1421", {
  baudrate: 57600
});
var users = [];
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
    if (heartRate > 100) message = "Woah, you are a little excited";
    if (heartRate < 50)  message = "Your heart rate is super low. Breathe a little.";
    latestData = heartRate;
    var toSend = {
      "bpm": heartRate,
      "msg": message
    }
    console.log("sending: ".white+ JSON.stringify(toSend,null,'\t'));
    // io.emit('bpm-update', toSend);
    var firstuser = users[0].id; // get id of first user
    io.to(firstuser).emit('bpm-update', toSend); // emit event only to that user
    
  }
}

io.on('connection', function(socket){
  console.log(socket.id + 'just connected');
  addUser(socket.id);
  askQuestion();

  socket.on('disconnect', function() {
  console.log(socket.id + 'just disconnected');
  removeUser(socket.id);
  });

  socket.on('bpm-update', function(data){
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

function sendData(request) {

  request.respond(latestData);

};

function askQuestion() {
  //generate random id from number of items in JSON file
  var id = Math.floor(Math.random() * 5);
  console.log("Random id: "+id);

  fs.readFile('questions.json', 'utf8', function(err, res){
  obj = JSON.parse(res);
  randomQue = obj[id].question;
  console.log(randomQue);
  var queCrit = {
    "question": randomQue
  }
  io.emit('why', queCrit);
  });
};

function addUser(user, socket) {
  if(users.indexOf(user) === -1) {
    var id = user; //user = socket.id
    var userObj = {
      id: id
    };
    users.push(userObj);
    console.log('current users: '+users.length);
    console.log(users);
    io.sockets.emit('new user', users);
  }
}

function removeUser(user) {
  users.splice(user, 1);
  console.log('current users: '+users.length);
}
