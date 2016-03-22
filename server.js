'use strict';

var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var io = require('socket.io')(server);


var rooms = []; // maintain a list of rooms


server.listen(80);
app.use('/', express.static('html/'));
