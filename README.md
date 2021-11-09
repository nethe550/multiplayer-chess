# Multiplayer Chess (v1.0.1)
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

# Updates
## v1.0.1
- Added room availability display on room join menu
- Fixed error with status saying player is in check by themselves
- Fixed CSS for Chrome-based browsers
- Fixed CSS for Safari-based browsers
- Theme switcher now stores preference as a cookie
- Styled the chess board to match the themes better
- Auto-resize chess board on window resize for reactive layout
- Fixed some invalid state situations caused by joining / leaving the same game multiple times
- Fixed usability on mobile devices
