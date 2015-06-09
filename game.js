var util = require("util"),
    io = require("socket.io"),
    Player = require("./Player").Player,
    app = require('http').createServer(handler);

app.listen(3000);

var socket,
    players;

function init() {

    players = [];

    socket = io.listen(3000);

    socket.configure(function () {
        socket.set("transports", ["websocket"]);
        socket.set("log level", 2);
    });

    setEventHandlers();
}


var setEventHandlers = function () {
    socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
    util.log("New player has connected: " + client.id);

    client.on("disconnect", onClientDisconnect);

    client.on("new player", onNewPlayer);

    client.on("move player", onMovePlayer);
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

function onMovePlayer(data) {
    var movePlayer = playerById(this.id);

    if (!movePlayer) {
        util.log("Player not found: " + this.id);
        return;
    }

    // Update player position
    movePlayer.setX(data.x);
    movePlayer.setY(data.y);

    var checkCollision = new isCollide(this.id);
    if (checkCollision[0]) {
        var removePlayer = playerById(checkCollision[1]);
        players.splice(players.indexOf(removePlayer), 1);
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
    for (i = 0; i < players.length; i++) {
        if (player_id != players[i].id && (playerById(player_id).getX() <= players[i].getX() + 7) && (playerById(player_id).getX() >= players[i].getX() - 7) &&
            (playerById(player_id).getY() <= players[i].getY() + 7) && (playerById(player_id).getY() >= players[i].getY() - 7)
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