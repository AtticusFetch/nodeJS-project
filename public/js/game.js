var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	// Local player
	remotePlayers,	// Remote players
	socket;			// Socket connection


function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Initialise keyboard controls
	keys = new Keys();

	var startX = Math.round(Math.random()*(canvas.width-5)),
		startY = Math.round(Math.random()*(canvas.height-5));

	// Initialise the local player
	localPlayer = new Player(startX, startY);

	// Initialise socket connection
	//socket = io.connect("http://localhost", {port: 3000, transports: ["websocket"]});

	// Initialise remote players array
	remotePlayers = [];

	// Start listening for events
	setEventHandlers();
}


var setEventHandlers = function() {
	// Keyboard1
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Window resize
	window.addEventListener("resize", onResize, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);

	socket.on("increase player", onIncrease);
};

function onIncrease(data) {
	playerById(data.id).setSize(playerById(data.id).getSize() * 1.5);
}

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	}
}

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	}
}

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");

	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
}

// Socket disconnected
function onSocketDisconnect() {
    alert('you lost');
	console.log("Disconnected from socket server");
}

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);

	// Initialise the new player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = data.id;

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
}

// Move player
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	}

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

	var checkCollision = new isCollide(this.id);
	if (checkCollision[0]) {
		this.emit("remove player", {id: checkCollision[1]});
	}
}

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);
	// Player not found
	if (!removePlayer) {
		console.log(data.id + 'lost');
		socket.disconnect();
		return;
	}

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
}

function isCollide(player_id) {
	for (i = 0; i < players.length; i++) {
        if (player_id != players[i].id && (playerById(player_id).getX() <= players[i].getX() + 6) && (playerById(player_id).getX() >= players[i].getX() - 6) &&
            (playerById(player_id).getY() <= players[i].getY() + 6) && (playerById(player_id).getY() >= players[i].getY() - 6)
        ) {
			return [true, players[i].id]
		}
	}
}


function animate() {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
}


function update() {
	// Update local player and check for change
	if (localPlayer.update(keys)) {
		// Send local player data to the game server
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
	}
}

function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the local player
	localPlayer.draw(ctx);

	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx);
	}
}

// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	}

	return false;
}