// queuing server that sends clients to the actual server one at a time (should not be run from the pi)

'use strict';

var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var colors = require('colors');

var sockets = [];    // just the id's
var current = -1;

var occupied = false;


setupServer();
setupConnection();


function setupServer() {

    server.listen(8080);
    app.use('/', express.static('html/'));
    console.log("server running on port 8080");
}

function setupConnection() {

    io.on('connection', function (socket) {

        console.log(colors.green(">    connect:"), colors.white(socket.id));

        socket.emit('updateQueue', sockets);
        socket.on('joinQueue', joinQueue);
        socket.on('disconnect', function() {

            console.log(colors.red("> disconnect:"), colors.white(socket.id));

            for(var i = 0; i < sockets.length; i++) {

                if(sockets[i].id == socket.id.substring(2)) sockets[i].status = 'left';
            }

            // sombody left, update queue;
            io.emit('updateQueue', sockets);
        });
    });
}

function joinQueue(data) {

    console.log("join the queue", data)

    sockets.push({ id:data, status:'active' });
    //sktQue.push(socket);
    var socket;
    for(var id in io.sockets.sockets) {
      if(id.substring(2) == data) socket = io.sockets.sockets[id];
    }

    io.emit('updateQueue', sockets);

    io.to(socket).emit('addedToQueue'); // not listening for this yet but might be handy if we're checking for repeat users on the server
    //socket.emit('welcome', sockets);

    socket.on('playing', playing);


    console.log("occupied", occupied);
    if(!occupied) nextPlayer();
}


function nextPlayer() {

    console.log("nextPlayer");

    current++;

    console.log(current, sockets.length);

    if(current <= sockets.length) {

        if(sockets[current] && sockets[current].status == 'active') {     // make sure connection is still around

            //occupied = true;
            startTurn();
        }
        else {

            console.log("client", current, "is no longer connected, moving on");
            nextPlayer();
        }
    }

    else {

        console.log("at end of queue, wait for a new player to connect, then start again");
        //current--;
        occupied = false;
    }
}


function playing(data) {

    console.log("client is playing");
    setTimeout(endTurn, 10000);
}

function startTurn() {

    console.log("starting turn", sockets[current]);
    sockets[current].status = 'playing';
    io.to('/#' + sockets[current].id).emit('startturn', sockets);
    io.emit('updateQueue', sockets);
    occupied = true;
}

function endTurn() {

    console.log("ending turn");
    sockets[current].status = 'active'
    io.to('/#' + sockets[current].id).emit('endturn', sockets);
    io.emit('updateQueue', sockets);
    occupied = false;
    if(current < sockets.length - 1) nextPlayer();
}
