'use strict';

var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var colors = require('colors');
var gpio = require("gpio");

var gpio2, gpio3, gpio4, gpio14, gpio7;

var gpioArray = [];

var rooms = []; // maintain a list of rooms
var dir = ['◀','▲','▶','▼'];
var offset = [
    { x:-1, y:0 },
    { x:0, y:-1 },
    { x:1, y:0 },
    { x:0, y:1 }
];

var position = { x:0, y:0 };

setupServer();
setupGPIO();



function setupServer() {

    server.listen(8888);
    app.use('/', express.static('html/'));
    console.log("server running on port 8888");
}

function setupConnection() {

    gpioArray.push(gpio2, gpio3, gpio4, gpio14);
    flashSequence();

    io.on('connection', function (socket) {

        console.log(colors.gray("incoming connection", socket.id));
        setTimeout(function() { gpio7.set(1) }, 0);
        setTimeout(function() { gpio7.set(0) }, 250);
        setTimeout(function() { gpio7.set(1) }, 500);
        setTimeout(function() { gpio7.set(0) }, 750);

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
}

function setupGPIO() {

    setupPin2();
}

function setupPin2() { gpio2 = gpio.export( 2, { direction:'out', interval:100, ready:setupPin3 }); }
function setupPin3() { gpio3  = gpio.export( 3, { direction:'out', interval:100, ready:setupPin4 }); }
function setupPin4() { gpio4  = gpio.export( 4, { direction:'out', interval:100, ready:setupPin14 }); }
function setupPin14() { gpio14 = gpio.export(14, { direction:'out', interval:100, ready:setupPin7 }); }
function setupPin7() { gpio7 = gpio.export(7, { direction:'out', interval:100, ready:setupConnection }); }


function flashSequence() {

    gpio2.set(0);
    gpio3.set(0);
    gpio4.set(0);
    gpio14.set(0);

    // blink all on
    setTimeout(function() { gpio2.set(1); }, 500);
    setTimeout(function() { gpio3.set(1); }, 500);
    setTimeout(function() { gpio4.set(1); }, 500);
    setTimeout(function() { gpio14.set(1); }, 500);

    // blink all off
    setTimeout(function() { gpio2.set(0); }, 1000);
    setTimeout(function() { gpio3.set(0); }, 1000);
    setTimeout(function() { gpio4.set(0); }, 1000);
    setTimeout(function() { gpio14.set(0); }, 1000);

    // blink in sequence
    setTimeout(function() { gpio2.set(1); }, 2000);
    setTimeout(function() { gpio2.set(0); }, 2100);

    setTimeout(function() { gpio3.set(1); }, 2050);
    setTimeout(function() { gpio3.set(0); }, 2150);

    setTimeout(function() { gpio4.set(1); }, 2100);
    setTimeout(function() { gpio4.set(0); }, 2200);

    setTimeout(function() { gpio14.set(1); }, 2150);
    setTimeout(function() { gpio14.set(0); }, 2250);

    setTimeout(function() { gpio2.set(1); }, 2200);
    setTimeout(function() { gpio2.set(0); }, 2300);

    setTimeout(function() { gpio3.set(1); }, 2250);
    setTimeout(function() { gpio3.set(0); }, 2350);

    setTimeout(function() { gpio4.set(1); }, 2300);
    setTimeout(function() { gpio4.set(0); }, 2400);

    setTimeout(function() { gpio14.set(1); }, 2350);
    setTimeout(function() { gpio14.set(0); }, 2450);
}
