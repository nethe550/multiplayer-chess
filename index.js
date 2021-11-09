const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

const config = require('./config.json');
const GameManager = require('./game/GameManager.js');

const gameManager = new GameManager(config.games || 128);

app.use(express.static(__dirname + '/view'));

app.get('/', (req, res) => {

    res.sendFile(__dirname + '/view/index.html');
    
});

app.get('/init', (req, res) => {
    res.json({ games: gameManager.games.length });
});

app.get('/room-status', (req, res) => {
    res.json(gameManager.getGamesStatus());
});

io.on('connection', (socket) => {

    const playerId = gameManager.getNewPlayerId();

    // this socket's color
    let color;

    // this socket's game's players
    let players;

    // this socket's room id
    let roomID;

    // recieved a new socket trying to join a game
    socket.on('join', (roomId) => {

        if (gameManager.games.length - 1 < roomId) return socket.emit('error', 'Room does not exist!');

        // add them to the game
        if (gameManager.games[roomId].players < 2) {
            gameManager.games[roomId].players++;
            gameManager.games[roomId].pid[gameManager.games[roomId].players - 1] = playerId;

            roomID = roomId;

            socket.emit('send-room-status', gameManager.getGamesStatus());
            socket.broadcast.emit('send-room-status', gameManager.getGamesStatus());
            
        }
        // game is full
        else {
            roomID = null;
            return socket.emit('full', roomId);
        }

        players = gameManager.games[roomId].players;

        // assign color by what player they are
        if (players % 2 == 0) color = 'black';
        else color = 'white';

        // send trigger to set up client-side game
        socket.emit('player', { playerId, players, color, roomId });

    });

    // recieved when a player makes a move
    socket.on('move', (msg) => {

        socket.broadcast.emit('move', msg);

    });

    // recieved when both players have joined and the game can start
    socket.on('play', (msg) => {

        socket.broadcast.emit('play', msg);

    });

    socket.on('get-room-status', () => {

        socket.emit('send-room-status', gameManager.getGamesStatus());
        socket.broadcast.emit('send-room-status', gameManager.getGamesStatus());

    });
    
    socket.on('disconnect', () => {
        
        socket.broadcast.emit('player-exit', { room: roomID });
        gameManager.removePlayerFromGame(playerId);
        
        socket.emit('send-room-status', gameManager.getGamesStatus());
        socket.broadcast.emit('send-room-status', gameManager.getGamesStatus());

    });

});


server.listen(config.port || process.env.PORT, () => console.info(`Multiplayer chess running on port ${config.port}.`));