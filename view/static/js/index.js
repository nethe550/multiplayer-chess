const boardWrapperElement = document.getElementById('board-wrapper');
const boardElement = document.getElementById('board');
const room = document.getElementById('room-join-in');
const connectButton = document.getElementById('room-join-submit');
const state = document.getElementById('room-join-state');

// ==== Game ==== //

let board = null;
const game = new Chess();

const onDragStart = (source, piece, position, orientation) => {

    // disallow piece movement when game is over
    if (game.game_over()) return false;

    // disallow piece movement when game hasn't started
    if (play) return false;

    // disallow moving pieces of the other player
    if ((color === 'white' && piece.search(/^b/) !== -1) ||
        (color === 'black' && piece.search(/^w/) !== -1)) {
            return false;
    }

    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }

}

const onDrop = (source, target) => {

    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // always promote to queen for simplicity
    });

    // illegal move
    if (move === null) return 'snapback';
    else {

        // emit move event
        socket.emit('move', { move: move, board: game.fen(), room: roomId });

    }

    update();

}

// update board position after the piece snap
// for castling, en passant, pawn promotion
const onSnapEnd = () => {

    board.position(game.fen());

}

const update = () => {

    let turn = 0;

    if (game.turn() === game.BLACK) turn = 1;

    if (game.in_checkmate()) state.innerText = `Checkmate by ${turn == 0 ? 'Black' : 'White'}!`;

    else if (game.in_check()) state.innerText = `${turn == 0 ? 'Black' : 'White'} in check by ${turn == 0 ? 'White' : 'Black'}.`;

    else if (game.in_stalemate()) state.innerText = `Stalemate.`;

    else if (game.in_draw()) state.innerText = `Draw.`;

    else {

        if (!play) state.innerText = `${turn == 0 ? 'White' : 'Black'}'s turn...`;

    }

}

// ==== Socket.IO ==== //

const socket = io();

// this player's piece color
let color = 'white';

// players in current room
let players;

// the room ID
let roomId;

// if both players have joined, then false
let play = true;

// the server settings
let serverSettings = null;

$.ajax('/init', {
    type: 'GET',
    dataType: 'json',
    success: (data) => {
        serverSettings = data;
    },
    error: (err) => {
        console.error(err);
    }
});

boardWrapperElement.style.display = 'none';
boardElement.style.display = 'none';

update();

socket.on('player', (msg) => {

    color = msg.color;

    players = msg.players;

    roomId = msg.roomId;

    state.innerText = `Player ${players} : ` + color;

    // emit play event when 2 players have joined
    if (players == 2) {

        play = false;

        socket.emit('play', msg.roomId);

        state.innerText = `Joined game ${msg.roomId}.`;

        update();

    }
    else {

        state.innerText = 'Waiting for player...';

    }

    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    }
    
    board = Chessboard('board', config);

    board.orientation(color);

});

socket.on('full', (msg) => {

    if (roomId == msg) {
        window.location.assign(window.location.href + 'room-full.html');
    }

});

socket.on('play', (msg) => {

    if (msg == roomId) {
        play = false;
        state.innerText = `Joined game ${msg}.`;

        update();
    }

});

socket.on('move', (msg) => {

    if (msg.room == roomId) {
        game.move(msg.move);
        board.position(game.fen());

        update();
    }

});

socket.on('error', (msg) => {

    state.innerText = msg;

});

socket.on('player-exit', (msg) => {

    if (msg.room == roomId) {

        state.innerText = `The other player left the game.`;

        // recreate board and disable interaction
        const config = {
            draggable: false,
            position: game.fen()
        }
        
        board = Chessboard('board', config);
    
        board.orientation(color);

    }

});

const connect = () => {

    roomId = room.value;

    if (roomId !== "" && !isNaN(parseInt(roomId))) {

        if (!serverSettings || !serverSettings.games) {
            state.innerText = 'Unable to contact server. Try reloading the page.';
            return false;
        }

        if (parseInt(roomId) > serverSettings.games) {
            state.innerText = `Invalid room number! Valid room IDs: 0 to ${serverSettings.games - 1}.`;
            return false;
        }

        room.remove();
        state.innerText += ` (Room ${roomId})`;
        connectButton.remove();
        document.getElementById('room-join').remove();

        exposeBoard();

        socket.emit('join', roomId);

        return true;

    }
    else {
        state.innerText = 'Invalid room number!';
        return false;
    }

};

connectButton.addEventListener('click', connect);

const exposeBoard = () => {

    boardWrapperElement.style.display = 'unset';
    boardElement.style.display = 'unset';

}