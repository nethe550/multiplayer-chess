const boardWrapperElement = document.getElementById('board-wrapper');
const boardElement = document.getElementById('board');
const room = document.getElementById('room-join-in');
const connectButton = document.getElementById('room-join-submit');
const state = document.getElementById('room-join-state');
const roomStatusWrapperElement = document.getElementById('room-status-wrapper');
const roomStatusElement = document.getElementById('room-status');


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

    else if (game.in_check()) state.innerText = `${turn == 0 ? 'White' : 'Black'} in check by ${turn == 0 ? 'Black' : 'White'}.`;

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

// the room statuses
let roomStatus = null;

const populateRoomStatus = () => {

    if (!play) return; // ignore while game is in progress

    setTimeout(() => {

        roomStatusElement.innerHTML = '';

        if (!roomStatus || !roomStatus.games) roomStatusElement.innerText = 'Failed to reach servers.';

        const addLeadingZeroes = (str, maxLength) => {
            str = str.toString();
            maxLength = maxLength.toString();

            for (let i = str.length; i < maxLength.length; i++) {
                str = "0" + str;
            }

            return str;
        }

        for (let i = 0; i < roomStatus.games.length; i++) {

            const rootElement = document.createElement('div');

            rootElement.classList.add('room-status-list-item');
            rootElement.style.display = 'block';
            rootElement.style.margin = '0.125em';
            rootElement.style.padding = '0.25em 0.5em';
            rootElement.style.backgroundColor = 'var(--tertiary-background-color)';
            rootElement.style.border = '1px solid var(--border-color)';
            rootElement.style.borderRadius = 'var(--border-radius)';
            rootElement.style.minWidth = '210px';

            const idElement = document.createElement('span');

            idElement.style.fontFamily = 'Courier New, Courier, monospace';
            idElement.style.height = 'calc(100% - 0.5em)';
            idElement.style.paddingRight = '12px';
            idElement.style.borderRight = '1px solid var(--border-color)';
            idElement.innerText = addLeadingZeroes(i, roomStatus.games.length);

            rootElement.appendChild(idElement);

            const playersElement = document.createElement('span');

            playersElement.style.fontFamily = 'Courier New, Courier, monospace';
            playersElement.style.padding = '0 0.5em';
            playersElement.innerText = `Players: ${roomStatus.games[i].currentPlayers}`;

            rootElement.appendChild(playersElement);

            const inProgressElement = document.createElement('span');

            inProgressElement.style.fontFamily = 'Courier New, Courier, monospace';
            inProgressElement.style.padding = '0.25em 0.5em';
            // This makes the rooms list look better, but recalculating the float position on resize is quite slow
            // inProgressElement.style.float = 'right';
            inProgressElement.style.verticalAlign = 'center';
            inProgressElement.style.borderLeft = '1px solid var(--border-color)';
            inProgressElement.style.color = roomStatus.games[i].inProgress ? 'var(--closed-color)' : 'var(--open-color)';
            inProgressElement.innerHTML = `${roomStatus.games[i].inProgress ? 'Closed' : 'Open&nbsp;&nbsp;'}`;

            rootElement.appendChild(inProgressElement);

            roomStatusElement.appendChild(rootElement);

        }

    }, 750); // allow 750 ms for server to respond

}

boardWrapperElement.style.display = 'none';
boardElement.style.display = 'none';
roomStatusWrapperElement.style.display = 'block';

update();

socket.emit('get-room-status');

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
        window.location.assign('./room-full.html');
    }

});

socket.on('play', (msg) => {

    if (msg == roomId) {
        play = false;
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

    if (msg.room == roomId && !play) {

        state.innerText = `The other player left the game.`;

        // recreate board and disable interaction
        const config = {
            draggable: false,
            position: game.fen()
        }

        board = Chessboard('board', config);

        board.orientation(color);

        play = true;

    }

});

socket.on('send-room-status', (msg) => {
    roomStatus = msg;
    window['roomStatus'] = roomStatus;
    populateRoomStatus();
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

    boardWrapperElement.style.display = 'block';
    boardElement.style.display = 'block';
    roomStatusWrapperElement.style.display = 'none';
    boardElement.style.width = '100%';
    boardElement.style.height = '100%';

}

const getNormalizedInRange = (value, min, max) => {

    return (value - min) / (max - min);

}

const updateBoardSize = () => {

    if (play) return;

    const dimension = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight;

    document.querySelector(':root').style.setProperty('--board-width', `${getNormalizedInRange(dimension / 2.75, 0, dimension) * 100}%`);

    boardWrapperElement.style.width = 'var(--board-width)';
    boardWrapperElement.style.height = 'var(--board-width)';
    boardElement.style.width = '100%';
    boardElement.style.height = '100%';
    if (board) board.resize();

}

window.addEventListener('DOMContentLoaded', updateBoardSize);
window.addEventListener('resize', updateBoardSize);