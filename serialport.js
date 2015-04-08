var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/cu.usbmodem1421", {
  baudrate: 57600
});
var servi = require('servi');
var app = new servi(false); // servi instance
app.port(8080);             // port number to run the server on
var latestData = 0;
// configure the server's behavior:
app.serveFiles("public");     // serve static HTML from public folder
app.route('/data', sendData); // route requests for /data to sendData()
// now that everything is configured, start the server:
app.start();

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
   console.log(data.toString())
   latestData = data;
}

function sendData(request) {
  // print out the fact that a client HTTP request came in to the server:
  console.log("Got a client request, sending them the data.");
  // respond to the client request with the latest serial string:
  request.respond(latestData);
}


