let ClientBoardModel = require('../Models/ClientBoard');

let GameModule = {};

GameModule.initStaffPage = function (data, socket) {
    socket.emit('initPage', data);
};

GameModule.initClientPage = function (data, io) {
    io.to('client').emit('initPage', data);
};

GameModule.getGameDetails = async function (game, startDate) {
    return new Promise(resolve => {
        let data = {};
        if (game) {
            data.game = game;
            if(game.boardpurchase && startDate) {
                data.startDate = startDate;
            }
            ClientBoardModel.getActiveBoardsWithClients(game.id).then(boards => {
                if (boards.length > 0) {
                    data.boards = boards;
                }
                resolve(data);
            });
        } else {
            resolve(data);
        }
    });
};

GameModule.createIfNotExists = async function () {
    return new Promise(resolve => {
        this.getActiveGame().then(game => {
            if (!game) {
                this.newGame().then(game => {
                    resolve(game);
                });
            } else {
                resolve(game);
            }
        })
    });
};

module.exports = GameModule;