'use strict';

console.log("we're up and running!");

var Joystck = (function() {

    var joystck = this;
    var socket;

    connect();
    listen();

    function connect() {

        socket = io.connect('localhost' + ':80', { transports: ['websocket'] });

        socket.io.on('connect_error', function() {
            console.log('connection error');
        });

        socket.on('welcome', function(data) {

            console.log('welcome', data);

            console.log(socket);
        });
    }

    function listen() {

        document.onkeydown = function(e) {
            e = e || window.event;

            socket.emit('keypress', { key: e.which || e.keyCode });

            switch(e.which || e.keyCode) {
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

                default: return; // exit this handler for other keys
            }
            e.preventDefault();
        };
    }


    return joystck;

}) ();
