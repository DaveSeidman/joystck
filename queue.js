// queuing server that sends clients to the actual server one at a time (should not be run from the pi)

'use strict';

var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var colors = require('colors');

var sidQue = [];    // just the id's
var sktQue = [];    // actual socket refs
var current = -1;

var nobodyPlaying = true;

var timeslots = [];

server.listen(80);
app.use('/', express.static('html/'));



console.log("server running on port 80");

io.on('connection', function (socket) {

    console.log(colors.green(">    connect:"), colors.white(socket.id));

    sidQue.push(socket.id);
    sktQue.push(socket);
    //for(var sckt in io.sockets.sockets) {
    //  console.log(sckt);
    //}

    socket.emit('welcome', sidQue);

    socket.on('playing', playing);

    socket.on('disconnect', function() {

        console.log(colors.red("> disconnect:"), colors.white(socket.id));

        for(var i = 0; i < sidQue.length; i++) {

            if(sidQue[i] == socket.id) delete sidQue[i];
        }
    });

    console.log("is anybody playing?", nobodyPlaying);
    if(nobodyPlaying) nextPlayer();
});




function nextPlayer() {

    console.log("nextPlayer");
    current++;

    if(current <= sidQue.length) {

        if(sidQue[current]) {     // make sure connection is still around

            io.to(sidQue[current]).emit('startturn', 'test');
            nobodyPlaying = false;
        }
        else {

            console.log("client", current, "is no longer connected, moving on");
            nextPlayer();
        }
    }

    else {

        console.log("at end of queue");
        console.log("wait for a new player to connect, then start again");
        nobodyPlaying = true;
    }
}


function playing(data) {

    console.log("okay, client is playing");

    setTimeout(endTurn, 3000);

}

function endTurn() {

    console.log("ending turn");
    io.to(sidQue[current]).emit('endturn', 'test');
    nobodyPlaying = true;
    nextPlayer();
}
