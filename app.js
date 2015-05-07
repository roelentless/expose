'use strict';

var express = require('express');
var app = express();
var fs = require('fs');
var expose = require('./lib/expose.js');



// load config (optional)
var configFile = {};
if( fs.existsSync('./config.json') ) {
    configFile = JSON.parse(fs.readFileSync('./config.json'));
}
var _config = {};
_config.port = configFile.port || '20000';
_config.route = configFile.route || '/hook/';



// routes
app.get(_config.route+':url_key', function(req, res) {
    expose.processRequest(req, res);
});

app.post(_config.route+':url_key', function(req, res) {
    expose.processRequest(req, res);
});

app.get('/', function(req, res){
  res.sendStatus(200);
});



app.listen(_config.port);

console.log("listening for webhooks on "+_config.port);
