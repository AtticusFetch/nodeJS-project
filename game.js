var util = require("util"),
    io = require("socket.io"),
    fs = require('fs'),
    Player = require("./Player").Player;
/*app = require('http').createServer(function(req, res) {
 var
 content = '',
 fileName = 'index.html',//the file that was requested
 localFolder = __dirname + '/public/';//where our public files are located

 //NOTE: __dirname returns the root folder that
 //this javascript file is in.

 if(fileName === 'index.html'){//if index.html was requested...
 content = localFolder + fileName;//setup the file name to be returned

 //reads the file referenced by 'content'
 //and then calls the anonymous function we pass in
 fs.readFile(content,function(err,contents){
 //if the fileRead was successful...
 if(!err){
 //send the contents of index.html
 //and then close the request
 res.end(contents);
 } else {
 //otherwise, let us inspect the eror
 //in the console
 console.dir(err);
 };
 });
 } else {
 //if the file was not found, set a 404 header...
 res.writeHead(404, {'Content-Type': 'text/html'});
 //send a custom 'file not found' message
 //and then close the request
 res.end('<h1>Sorry, the page you are looking for cannot be found.</h1>');
 };
 });

 app.listen(8000);*/

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
    playerById(data.id).setSize(playerById(data.id).getSize() * 1.5);
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
        this.emit("remove player", {id: checkCollision[1]});
        this.broadcast.emit("remove player", {id: checkCollision[1]});
        this.emit("increase player", {id: tmp});
        this.broadcast.emit("increase player", {id: tmp});
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
        if (player_id != players[i].id && (playerById(player_id).getX() <= players[i].getX() + players[i].getSize() / 2) && (playerById(player_id).getX() >= players[i].getX() - players[i].getSize() / 2) &&
            (playerById(player_id).getY() <= players[i].getY() + players[i].getSize() / 2) && (playerById(player_id).getY() >= players[i].getY() - players[i].getSize() / 2)
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