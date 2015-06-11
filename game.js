var util = require("util"),
    Player = require("./Player").Player;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

var socket,
    players;

function init() {

    players = [];

    //socket = io.listen(3000);
    http.listen(3000, function() {
        console.log('server started on 3000');
    });
    setEventHandlers();
}


var setEventHandlers = function () {
    io.sockets.on('connection', onSocketConnection);
};

function onSocketConnection(client) {
    util.log("New player has connected: " + client.id);

    client.on("disconnect", onClientDisconnect);

    client.on("new player", onNewPlayer);

    client.on("move player", onMovePlayer);

    client.on("increase player", onIncrease);
}

function onClientDisconnect() {
    util.log("Player has disconnected: " + this.id);

    var removePlayer = playerById(this.id);

    if (!removePlayer) {
        util.log("Player not found: " + this.id);
        return;
    }


    players.splice(players.indexOf(removePlayer), 1);

    this.broadcast.emit("remove player", {id: this.id});
}

function onNewPlayer(data) {
    var newPlayer = new Player(data.x, data.y);
    newPlayer.id = this.id;

    this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
    }


    players.push(newPlayer);
}

function onIncrease(data) {
    console.log('increase func' + data.id);
    playerById(data.id).setSize(playerById(data.id).getSize() * 1.5);
    this.broadcast.emit('increase player', data);
}

function onMovePlayer(data) {
    var movePlayer = playerById(this.id);

    if (!movePlayer) {
        util.log("Player not found: " + this.id);
        return;
    }

    var tmp = this.id;

    // Update player position
    movePlayer.setX(data.x);
    movePlayer.setY(data.y);

    var checkCollision = new isCollide(this.id);
    if (checkCollision[0]) {
        var removePlayer = playerById(checkCollision[1]);
        players.splice(players.indexOf(removePlayer), 1);
        this.emit("increase player", {id: tmp});
        this.broadcast.emit("increase player", {id: tmp});
        this.emit("remove player", {id: checkCollision[1]});
        this.broadcast.emit("remove player", {id: checkCollision[1]});
    }

    // Broadcast updated position to connected socket clients
    this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
}

function onRemovePlayer(data) {
    var removePlayer = playerById(data.id);

    console.log('inside onremoveplayer');

    if (!removePlayer) {
        util.log("Player not found: " + data.id);
        return;
    }


    players.splice(players.indexOf(removePlayer), 1);
}

function isCollide(player_id) {
    for (var i = 0; i < players.length; i++) {
        var halfAsize = 6;
        if (player_id != players[i].id && (playerById(player_id).getX() <= players[i].getX() + halfAsize) && (playerById(player_id).getX() >= players[i].getX() - halfAsize) &&
            (playerById(player_id).getY() <= players[i].getY() + halfAsize) && (playerById(player_id).getY() >= players[i].getY() - halfAsize)
        ) {
            return [true, players[i].id]
        }
    }
}


function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    }

    return false;
}


init();