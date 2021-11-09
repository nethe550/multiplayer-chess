const { attach } = require('engine.io');
const Game = require('./Game.js');

class GameManager {

    /**
     * Creates a new Game Manager.
     * @param {number} games The number of game instances to host
     */
    constructor(games) {

        /**
         * @type {Game[]}
         */
        this.games = Array(games);

        for (let i = 0; i < this.games.length; i++) {

            this.games[i] = new Game(0, [0, 0]);

        }

    }

    /**
     * Gets a new random ID for a player.
     * @returns {number} A random ID
     */
    getNewPlayerId() {

        return Math.floor((Math.random() * 100) + 1);

    }

    /**
     * Removes a player from a game.
     * @param {number} playerId The player ID
     */
    removePlayerFromGame(playerId) {

        for (let i = 0; i < this.games.length; i++) {

            if (this.games[i].pid[0] == playerId || this.games[i].pid[1] == playerId) {

                // no need to clear PIDs, just decrement players in game to allow for new players to connect
                this.games[i].players--;

            }

        }

    }

    /**
     * Gets information on all games running currently
     * @typedef {{ games: [ { currentPlayers: number, inProgress: boolean } ] }} GamesInfo
     * @returns {GamesInfo} The games info
     */
    getGamesStatus() {

        /**
         * @type {GamesInfo}
         */
        const gamesInfo = {
            games: []
        };

        for (let i = 0; i < this.games.length; i++) {

            const gameInfo = {
                currentPlayers: this.games[i].players,
                inProgress: this.games[i].players >= 2
            };

            gamesInfo.games.push(gameInfo);

        }

        return gamesInfo;

    }

}

module.exports = GameManager;