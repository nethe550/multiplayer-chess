# Multiplayer Chess
A multiplayer implementation of chess, using Chessboard.js, Chess.js, Express.js, and Socket.IO.

This is hosted on my website, [the-index.info](http://the-index.info:25565).

## Setup
Setup is pretty simple.

1. Clone the repository: `git clone https://github.com/nethe550/multiplayer-chess.git && cd ./multiplayer-chess/`
2. Run `npm install` to install all dependencies.
3. Edit `port` in config.json. This is the port the Node.js server listens on. (default: 3000)
4. Edit `games` in config.json. This is the amount of concurrent game rooms that the server will serve. (default: 128)
5. Run `npm init` to start the server.

## How To Use
To access the chess server, go to `http://<your-hostname>:<your-port>`.

- `<your-hostname>` is the host name of whatever you're running the server off of. (Usually `localhost`)
- `<your-port>` is the port number you specified in config.json (default: 3000)
