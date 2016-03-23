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

    socket.on('joinQueue', joinQueue);
    //joinQueue(socket);
});


function joinQueue(data) {

    console.log("join the queue", data)

    sidQue.push({ id:data, status:'active' });
    //sktQue.push(socket);
    var socket;
    for(var id in io.sockets.sockets) {
      console.log(id.substring(2), data);
      if(id.substring(2) == data) socket = io.sockets.sockets[id];
    }

    //will call update queueInstead
    io.emit('updateQueue', sidQue);
    //socket.emit('welcome', sidQue);

    socket.on('playing', playing);

    socket.on('disconnect', function() {

        console.log(colors.red("> disconnect:"), colors.white(socket.id));

        for(var i = 0; i < sidQue.length; i++) {

            //if(sidQue[i] == socket.id) delete sidQue[i];
            if(sidQue[i].id == socket.id) sidQue[i].status = 'left';
        }

        // sombody left, update queue;
        io.emit('updateQueue', sidQue);
    });

    if(nobodyPlaying) nextPlayer();
}


function nextPlayer() {

    console.log("nextPlayer");

    if(current < sidQue.length - 1) {

        current++;

        if(sidQue[current].status == 'active') {     // make sure connection is still around

            startTurn();
        }
        else {

            console.log("client", current, "is no longer connected, moving on");
            nextPlayer();
        }
    }

    else {

        console.log("at end of queue, wait for a new player to connect, then start again");
        current--;
        nobodyPlaying = true;
    }
}


function playing(data) {

    console.log("okay, client is playing");

    setTimeout(endTurn, 3000);

}

function startTurn() {

    console.log("starting turn");
    sidQue[current].status = 'playing';
    io.to(sidQue[current].id).emit('startturn', sidQue);
    nobodyPlaying = false;
}

function endTurn() {

    console.log("ending turn");
    sidQue[current].status = 'active'
    io.to(sidQue[current].id).emit('endturn', sidQue);
    nobodyPlaying = true;
    nextPlayer();
}
