'use strict';

var Joystck = (function() {

    var joystck = this;
    var socket;
    var $title;
    var $queue;
    var $join;
    var $joystick;
    var $arrows;
    var host;
    var queIP = '192.168.108.22:80'; // keep this updated!
    var rpiIP = '108.54.246.220:8888';
    var timer = 10;

    document.addEventListener("DOMContentLoaded", ready);



    function prepareQueue() {

        //host = (window.location.host.indexOf('localhost') > -1) ? 'localhost' : queingIP;
        host = queIP;
        socket = io.connect(host, { transports: ['websocket'] });
        socket.io.on('connect_error', function() { console.log('connection error'); });

        //socket.on('welcome', welcome);
        socket.on('startturn', startturn);
        socket.on('endturn', endturn);
        socket.on('updateQueue', updateQueue);

    }

    function joinQueue() {

        $title.innerHTML = "you are in the queue";
        $join.classList.add('hidden');
        socket.emit('joinQueue', socket.id);
    }

    function updateQueue(data) {

        console.log("updating queue");
        $queue.innerHTML = '';
        for(var i = 0; i < data.length; i++) {

            var $player = document.createElement("p");
            $player.classList.add(data[i].status);
            $player.innerHTML =  data[i].id.substring(2);
            if(socket.id == data[i].id) {

                $player.classList.add('me');
            }
            $queue.appendChild($player);
        }
    }


    function startturn(data) {

        $joystick.classList.remove('hidden');
        console.log("my turn!", data);
        updateTitle();
        socket.emit('playing');
        updateQueue(data);
    }

    function updateTitle() {

        timer--;
        $title.innerHTML = "You are in control: " + timer;
        if(timer) setTimeout(updateTitle, 1000);
    }

    function endturn(data) {

        $joystick.classList.add('hidden');
        console.log("ending my turn!", data);
        $title.innerHTML = "You have played";
        updateQueue(data);
    }


    function connect() {

        //host = (window.location.host.indexOf('localhost') > -1) ? 'localhost' : '192.168.108.200';
        host = rpiIP;
        socket = io.connect(host, { transports: ['websocket'] });

        console.log("connecting to ", host + ':' + port);

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
        });

    }

    function listen() {

        /*document.onkeydown = function(e) {
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

        for(var i = 0; i < $arrows.length; i++) {
            var $arrow = $arrows[i];
            $arrow.addEventListener('click', function(e) {

                console.log(e.target.index);
            });
        }*/


        $join.addEventListener('mouseup', joinQueue);
    }

    function ready() {

        $title = document.getElementById('title');
        $queue = document.getElementById('queue');
        $joystick = document.getElementById('joystick');
        $arrows = $joystick.querySelectorAll('a');
        $join = document.getElementById('join');

        //connect();
        listen();
        prepareQueue();
    }

    return joystck;

}) ();
