// manage all rpi events and talk to rpi server

'use strict';

var RPI = (function() {

    var rpi = {};

    var socket;
    var rpiInternalIP = '192.168.108.15:8888'; // this only works from inside out network
    var rpiExternalIP = '108.54.246.220:8888'; // this only works from outside our network

    rpi.connect = function() {

        var host = (window.location.hostname.indexOf('192.168') + 1 || window.location.hostname.indexOf('localhost') + 1) ? rpiInternalIP : rpiExternalIP;
        rpi.socket = socket = io.connect(host, { transports: ['websocket'] });

        socket.io.on('connect_error', function() { console.log('connection error'); });

        socket
        .on('welcome', function(data) {
            dispatchEvent(new Event('rpiWelcome'));
            listen();
        })
        .on('keydown', function(data) {
            dispatchEvent(new CustomEvent('rpiKeyDown', { "detail" : data }));
        })
        .on('keyup', function(data) {
            dispatchEvent(new CustomEvent('rpiKeyUp', { "detail" : data }));
        });
    };

    function listen() {

        document.onkeydown = function(e) {
            e = e || window.event;
            var key = e.which || e.keyCode;
            key -= 37; // to align with array of arrows [0-3]
            if(key >= 0 && key <= 4) {
                socket.emit('keydown', { key: key });
                e.preventDefault();
            }
        };
        document.onkeyup = function(e) {
            e = e || window.event;
            var key = e.which || e.keyCode;
            key -= 37; // to align with array of arrows [0-3]
            if(key >= 0 && key <= 4) {
                socket.emit('keyup', { key: key });
                e.preventDefault();
            }
        };

        /*for(var i = 0; i < $arrows.length; i++) {
            var $arrow = $arrows[i];
            $arrow.addEventListener('click', function(e) {

                console.log(e.target.index);
                // to do: emit to rpi here
            });
        }*/
    }

    function unlisten() {

        document.onkeydown = null;
        document.onkeyup = null;
    }


    return rpi;
});
