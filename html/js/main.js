'use strict';

console.log("we're up and running!");

var Joystck = (function() {

    var joystck = this;
    var socket;
    var $joystick;
    var $arrows;

    connect();
    listen();

    function connect() {

        socket = io.connect('localhost' + ':80', { transports: ['websocket'] });

        socket.io.on('connect_error', function() {
            console.log('connection error');
        });
        socket
        .on('welcome', function(data) {

            console.log('welcome', data);
        })
        .on('keydown', function(data) {
            var arrow = $arrows[data.key];
            arrow.classList.add('active');
        })
        .on('keyup', function(data) {
            var arrow = $arrows[data.key];
            arrow.classList.remove('active');
        })

    }

    function listen() {

        document.addEventListener("DOMContentLoaded", ready);

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
    }

    function ready() {

        $joystick = document.getElementById('joystick');
        $arrows = $joystick.querySelectorAll('a');
    }

    return joystck;

}) ();
