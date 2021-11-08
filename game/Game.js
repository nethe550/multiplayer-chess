class Game {

    /**
     * Creates a new Game instance.
     * @typedef {[number, number]} PID
     * @param {number} players The amount of players in this game
     * @param {PID} pid The player IDs in the game
     */
    constructor(players, pid) {

        /**
         * @type {number}
         */
        this.players = players;

        /**
         * @type {PID}
         */
        this.pid = pid;

    }

}

module.exports = Game;