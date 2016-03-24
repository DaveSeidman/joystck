// main entry point for program, delegates events between que and rpi objects

'use strict';

var Claw = (function() {

    var claw = {};
    var $title;
    var $queue;
    var $join;
    var $joystick;
    var $arrows;
    var countdown;

    var que, rpi;

    claw.que = que = new QUE;
    claw.rpi = rpi = new RPI;

    document.addEventListener("DOMContentLoaded", ready);

    function ready() {

        $title = document.getElementById('title');
        $queue = document.getElementById('queue');
        $joystick = document.getElementById('joystick');
        $arrows = $joystick.querySelectorAll('a');
        $join = document.getElementById('join');

        $title.setAttribute('original', $title.innerHTML);
        $queue.setAttribute('original', $queue.innerHTML);

        $join.addEventListener('mouseup', que.join);

        if(window.location.hash == '#bypass') setupRPI();
        else setupQUE()
    }

    function setupQUE() {

        addEventListener('queWelcome', queWelcome);
        addEventListener('queAdded', queAdded);
        addEventListener('updateQueue', updateQueue);
        addEventListener('startTurn', startTurn);
        addEventListener('endTurn', endTurn);

        que.connect();
    }

    function queWelcome() {

        $title.innerHTML = $title.getAttribute('original');
        $queue.innerHTML = $queue.getAttribute('original');
    }

    function queAdded() {

        $join.classList.add('hidden');

    }

    function startTurn() {

        $joystick.classList.remove('hidden');
        countdown = 10;
        showCountdown();
        setupRPI();
        rpi.connect();
    }

    function showCountdown() {

        countdown--;
        $title.innerHTML = "You are in control: " + countdown;
        if(countdown) setTimeout(showCountdown, 1000);
    }

    function endTurn() {

        $joystick.classList.add('hidden');
        //$title.innerHTML = "You have played";
        rpi.socket.emit('disconnectMe');
    }

    function updateQueue() {

        $queue.innerHTML = '';
        for(var i = 0; i < que.socketList.length; i++) {

            var $player = document.createElement("p");
            $player.classList.add(que.socketList[i].status);
            $player.innerHTML =  que.socketList[i].id.substring(2);
            if(que.socket.id == que.socketList[i].id) {

                if(i - que.current > 0) $title.innerHTML = "You are #" + (i - que.current) +  " in line";
                else if(i == que.current) $title.innerHTML = "You are in control";
                else $title.innerHTML = "You have played";
                $player.classList.add('me');
            }
            $queue.appendChild($player);
        }
    }








    function setupRPI() {

        addEventListener('rpiWelcome', rpiWelcome);
        addEventListener('rpiKeyDown', rpiKeyDown);
        addEventListener('rpiKeyUp', rpiKeyUp);

        rpi.connect();
    }

    function rpiKeyDown(data) {

        var arrow = $arrows[data.detail.key];
        arrow.classList.add('active');
    }

    function rpiKeyUp(data) {

        var arrow = $arrows[data.detail.key];
        arrow.classList.remove('active');
    }

    function rpiWelcome() {

        $joystick.classList.remove('hidden');
    }


    return claw;

}) ();
