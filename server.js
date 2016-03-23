'use strict';

var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var colors = require('colors');

var rooms = []; // maintain a list of rooms


server.listen(80);
app.use('/', express.static('html/'));

console.log("server running on port 80");


io.on('connection', function (socket) {

    console.log(colors.gray("incoming connection", socket.id));

    socket.emit('welcome', { id : socket.id });

    socket.on('keypress', function(data) {

        // send the signal right back to client to confirm it's been received
        // when the claw machine is attached to pi, this event should also
        // return the updated position of the claw.
        
        socket.emit('keypressReceived', data);

        switch(data.key) {
            case 37: // left
                console.log('left');
            break;
            case 38: // up
                console.log('up');
            break;
            case 39: // right
                console.log('right');
            break;
            case 40: // down
                console.log('down');
            break;
        }

    });

});
