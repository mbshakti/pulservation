var net = require('net');
var io = require('socket.io')(server);
var express = require('express');
var colors = require('colors');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 3000;
var fs = require('fs');
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/cu.usbmodem1411", {
  baudrate: 57600
});
var users = [];
var latestData = 0;
var heartRate;
var message;
var name =[];

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
    if (heartRate > 100) message = "Woah, a little excited";
    if (heartRate < 50)  message = "Heart rate is super low";
    latestData = heartRate;
    var toSend = {
      "bpm": heartRate,
      "msg": message
    }
    console.log("sending: ".white+ JSON.stringify(toSend,null,'\t'));
    // io.emit('bpm-update', toSend);

    for (var i = users.length - 1; i >= 0; i--) {
    var firstuser = users[0].id; // get id of first user
    io.to(firstuser).emit('bpm-update', toSend); //getting data from the other dude
    }    
  }
}

io.on('connection', function(socket){
  console.log(socket.id + 'just connected');
  addUser(socket.id);

  socket.on('disconnect', function() {
  console.log(socket.id + 'just disconnected');
  removeUser(socket.id);
  });

  socket.on('bpm-update', function(data){
    io.emit('bpm update', data);
  });

  socket.on('chat message', function(wholeMessage){
    io.emit('chat message', wholeMessage);
  });

  socket.on('click new', function() {
    askQuestion();
  });

  socket.on('user name', function(name) {
    socket.broadcast.emit('user name', name);
  });

  socket.on('user typing', function(){
    console.log(socket.id+'is typing');
    socket.broadcast.emit('user typing');
  });

  socket.on('more', function(data){
    socket.broadcast.emit('more', data);
  });

});

function sendData(request) {

  request.respond(latestData);

};

function askQuestion() {
  //generate random id from number of items in JSON file
  var id = Math.floor(Math.random() * 7);
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

function addUser(user, socket, name) {
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

// function addNames(user) {
//   users.push("stranger");
//   users.push("you");
//   console.log('jeeeeeezuz' +users);
// }


var client = net.connect({port: 18000, host:'localhost'}, function(){
  console.log('connected to server');

  client.on('end', function(){
    console.log('Disconnected from server');
  });

});

client.on('data', function(data, socket){
    console.log(data);
    for (var i = users.length - 1; i >= 0; i--) {
    var seconduser = users[1].id; // get id of first user
    io.to(seconduser).emit('other client', data); //getting data from the other dude
    }
});

client.setEncoding('utf8');


