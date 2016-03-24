// manage all queing functionality and talk to queuing server

'use strict';


var QUE = (function() {

    var que = {};
    var socket;
    var socketList;
    var current;
    var queInternalIP = 'localhost:8080';        // queue server running locally
    var queExternalIP = '54.215.238.219:8080';    // queue server running on aws

    que.connect = function() {

        var host = (window.location.hostname.indexOf('192.168') + 1 || window.location.hostname.indexOf('localhost') + 1) ? queInternalIP : queExternalIP;
        que.socket = socket = io.connect(host, { transports: ['websocket'] });
        socket.io.on('connect_error', function() { console.log('connection error'); });

        socket.on('welcome', welcome);
        socket.on('addedToQueue', addedToQueue);
        socket.on('startturn', startturn);
        socket.on('endturn', endturn);
        socket.on('updateQueue', updateQueue);
    };

    function welcome() {

        dispatchEvent(new Event('queWelcome'));
    }

    que.join = function() {

        socket.emit('joinQueue', socket.id);
    }

    function addedToQueue() {

        dispatchEvent(new Event('queAdded'));
    }

    function updateQueue(data) {

        que.socketList = socketList = data.sockets;
        que.current = current = data.current;
        //dispatchEvent(new CustomEvent('updateQueue', { "detail":data }));
        dispatchEvent(new Event('updateQueue'));
    }

    function startturn(data) {

        dispatchEvent(new Event('startTurn'));
        socket.emit('playing');
    }

    function endturn(data) {

        dispatchEvent(new Event('endTurn'));
    }


    return que;

});
