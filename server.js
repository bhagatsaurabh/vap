const express = require('express');
const bodyParser = require('body-parser');
var http = require('http');

var app = express();
const port = process.env.PORT || "8000";
app.set("port", port);
app.use(bodyParser.json());

// API Routes Start

// API Routes End

const staticFiles = express.static('client');
app.use(staticFiles);

const server = http.createServer(app);

server.on('error', (error) => {
  throw error;
});

server.on('listening', () => {
  console.log('Listening on port ' + app.get('port') + '...');
});

server.listen(port);