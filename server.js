'use strict';

var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var colors = require('colors');
var gpio = require("gpio");

var gpio2 = gpio.export(2, { direction:'out', ready: function() { gpio2.set(0); } });
var gpio3 = gpio.export(3, { direction:'out', ready: function() { gpio3.set(0); } });
var gpio4 = gpio.export(4, { direction:'out', ready: function() { gpio4.set(0); } });
var gpio14 = gpio.export(14, { direction:'out', ready: function() { gpio14.set(0); } });

var gpioArray = [gpio2,gpio3,gpio4,gpio14];

var rooms = []; // maintain a list of rooms
var dir = ['◀','▲','▶','▼'];
var offset = [
    { x:-1, y:0 },
    { x:0, y:-1 },
    { x:1, y:0 },
    { x:0, y:1 }
];

var position = { x:0, y:0 };

server.listen(8888);
app.use('/', express.static('html/'));

console.log("server running on port 8888");


io.on('connection', function (socket) {

    console.log(colors.gray("incoming connection", socket.id));

    socket.emit('welcome', { id : socket.id });

    socket.on('keydown', function(data) {

        // send the signal right back to client to confirm it's been received
        // when the claw machine is attached to pi, this event should also
        // return the updated position of the claw.

        position.x += offset[data.key].x;
        position.y += offset[data.key].y;
        data.position = position;

        gpioArray[data.key].set(1);

        socket.emit('keydown', data);
        console.log(dir[data.key], "◼");


    });

    socket.on('keyup', function(data) {

        // send the signal right back to client to confirm it's been received
        // when the claw machine is attached to pi, this event should also
        // return the updated position of the claw.

        gpioArray[data.key].set(0);

        socket.emit('keyup', data);
        console.log(dir[data.key], "◻");
    });

});
