let ClientModule = require('../ClientModule');
let GameModel = require('../../Models/Game');
let ClientBoardModel = require('../../Models/ClientBoard');
let ClientModel = require('../../Models/Client');
let NumberData = require('../../../data/Number');
let GameData = require('../../../data/Game');

/*
 * this.socket
 * this.io
 */

class Connection extends ClientModule {
    initListeners() {
        this.connection();
    };

    connection() {
        this.initRooms();

        this.initPage();
    };

    initPage() {
        GameModel.getActiveGame().then((game) => {
            let data = {};
            ClientModel.getBalance(this.clientId).then(balance => {
                data.balance = balance;
                if (game) {
                    data.startDate = GameData.startDate;
                    data.game = game;
                    data.numbers = NumberData.numbers;
                    ClientBoardModel.getActiveBoardsWithClients(game.id).then(boards => {
                        data.boards = boards;
                        this.initSocket(data);
                    });
                } else {
                    this.initSocket(data);
                }
            });
        });
    };

    initSocket(data) {
        this.clientRoom().emit('initPage', data);
    };
}

module.exports = Connection;