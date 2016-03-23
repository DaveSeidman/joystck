'use strict';

var Joystck = (function() {

    var joystck = this;
    var socket;
    var $title;
    var $joystick;
    var $arrows;
    var host;
    var port = 80;
    var queIP = '192.168.108.22'; // keep this updated!
    var rpiIP = '192.168.108.200';


    document.addEventListener("DOMContentLoaded", ready);


    //queue();
    //connect();
    //listen();

    function queue() {

        //host = (window.location.host.indexOf('localhost') > -1) ? 'localhost' : queingIP;
        host = queIP;
        socket = io.connect(host + ':' + port, { transports: ['websocket'] });
        socket.io.on('connect_error', function() { console.log('connection error'); });

        socket.on('welcome', welcome);
        socket.on('startturn', startturn);
        socket.on('endturn', endturn);
    }

    function welcome(data) {

        console.log(data);
        $title.innerHTML = "you are in the queue";
    }

    function startturn(data) {

        console.log("my turn!", data);
        $title.innerHTML = "you are now controlling the pi";
        socket.emit('playing');
    }

    function endturn(data) {
        console.log("ending my turn!", data);
        $title.innerHTML = "you have played";
    }


    function connect() {

        //host = (window.location.host.indexOf('localhost') > -1) ? 'localhost' : '192.168.108.200';
        host = rpiIP;
        socket = io.connect(host + ':' + port, { transports: ['websocket'] });

        socket.io.on('connect_error', function() { console.log('connection error'); });

        socket
        .on('welcome', function(data) {

            console.log('welcome', data);
        })
        .on('keydown', function(data) {

            console.log(data.position);
            var arrow = $arrows[data.key];
            arrow.classList.add('active');
        })
        .on('keyup', function(data) {
            var arrow = $arrows[data.key];
            arrow.classList.remove('active');
        })

    }

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
    }

    function ready() {

        $title = document.getElementById('title');
        $joystick = document.getElementById('joystick');
        $arrows = $joystick.querySelectorAll('a');

        console.log("dom ready");
        queue();
    }

    return joystck;

}) ();
