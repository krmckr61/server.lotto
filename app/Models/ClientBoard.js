let Sequelize = require('sequelize');
let sequelize = require('../../vendor/Sequalize/index');
let Game = require('./Game');
let Client = require('./Client');
let Board = require('./Board');
let Price = require('./Price');

let ClientBoard = sequelize.define('clientboard', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    gameid: {
        type: Sequelize.INTEGER,
        references: {
            // This is a reference to another model
            model: Game,
            // This is the column name of the referenced model
            key: 'id',
        }
    },
    clientid: {
        type: Sequelize.INTEGER,
        references: {
            // This is a reference to another model
            model: Client,
            // This is the column name of the referenced model
            key: 'id',
        }
    },
    boardid: {
        type: Sequelize.INTEGER,
        references: {
            // This is a reference to another model
            model: Board,
            // This is the column name of the referenced model
            key: 'id',
        }
    },
    firstzinc: {type: Sequelize.BOOLEAN, defaultValue: false},
    secondzinc: {type: Sequelize.BOOLEAN, defaultValue: false},
    bingo: {type: Sequelize.BOOLEAN, defaultValue: false},
    priceid: {type: Sequelize.INTEGER, defaultValue: 0},
    created_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
    updated_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
}, {
    timestamps: false,
    tableName: 'clientboard'
});

ClientBoard.getActiveBoardsWithClients = async function (gameId) {
    return new Promise((resolve) => {
        sequelize.query("SELECT clientboard.*, client.name FROM clientboard INNER JOIN client ON clientboard.clientid=client.id WHERE clientboard.gameid=" + gameId, {type: sequelize.QueryTypes.SELECT}).then(boards => {
            resolve(boards);
        });
    });
};

ClientBoard.getZinc = async function (gameId) {
    return new Promise((resolve) => {
        sequelize.query("SELECT CASE WHEN secondzinc = true THEN 'second' WHEN firstzinc = true THEN 'first' ELSE 'none' END as zinc FROM clientboard WHERE clientboard.gameid=" + gameId, {type: sequelize.QueryTypes.SELECT}).then(zinc => {
            if (zinc.length > 0) {
                resolve(zinc[0].zinc);
            } else {
                resolve('none');
            }
        });
    });
};

ClientBoard.getWinners = async function (gameId) {
    return new Promise(resolve => {
        sequelize.query("SELECT clientboard.*, client.name FROM clientboard INNER JOIN client ON clientboard.clientid=client.id WHERE clientboard.gameid=" + gameId + " AND (clientboard.firstzinc=true OR clientboard.secondzinc=true OR clientboard.bingo=true)").then(rows => {
            resolve(rows);
        });
    });
};

ClientBoard.getGameZinc = async function (zinc, gameId) {
    return new Promise(resolve => {
        zinc = zinc.toLowerCase();
        sequelize.query("SELECT boardid, clientid FROM clientboard WHERE gameid=" + gameId + " AND " + zinc + "=true", {type: sequelize.QueryTypes.SELECT}).then(clientboards => {
            if (clientboards.length > 0) {
                resolve(clientboards);
            } else {
                resolve(false);
            }
        });
    });
};

ClientBoard.buyBoard = async function (clientId, boardId, gameId, boardPrice, priceId) {
    return new Promise(resolve => {
        this.create({clientid: clientId, boardid: boardId, gameid: gameId, priceid: priceId}).then(clientBoard => {
            resolve(Client.buyBoard(clientId, boardPrice));
        });
    });
};

ClientBoard.getWithClientName = async function (boardId, gameId) {
    return new Promise(resolve => {
        sequelize.query("SELECT clientboard.*, client.name FROM clientboard INNER JOIN client ON clientboard.clientid=client.id WHERE clientboard.boardid=" + boardId + " AND clientboard.gameid=" + gameId, {type: sequelize.QueryTypes.SELECT}).then(clientboard => {
            resolve(clientboard[0]);
        });
    });
};

ClientBoard.setZincFromBoardId = async function (boardId, gameId, column) {
    return new Promise(resolve => {
        sequelize.query("UPDATE clientboard SET " + column + " = TRUE WHERE gameid=" + gameId + " AND boardid=" + boardId + " RETURNING clientid, priceid", {
            returning: true,
            type: sequelize.QueryTypes.SELECT
        }).then(clientBoard => {
            if (clientBoard.length > 0) {
                resolve(clientBoard[0]);
            } else {
                resolve(false);
            }
        });
    });
};

ClientBoard.addDefaultZincBoard = async function (boardId, gameId, column) {
    return new Promise(resolve => {
        let data = {clientid: 0, boardid: boardId, gameid: gameId, priceid: 0};
        data[column] = true;
        this.create(data).then(clientBoard => {
            resolve(clientBoard);
        });
    });
};


ClientBoard.setZincs = async function (boards, gameId, column) {
    return new Promise(resolve => {
        column = column.toLowerCase();
        if (boards.length > 0) {
            let priceClients = {};
            for (let i = 0; i < boards.length; i++) {
                let boardId = boards[i].id;
                this.setZincFromBoardId(boardId, gameId, column).then(clientBoard => {
                    if (clientBoard && clientBoard.priceid !== 0) {
                        Price.getZincPrice(clientBoard.priceid, column).then(price => {
                            Client.givePrice(clientBoard.clientid, price / boards.length).then(balance => {
                                priceClients[boardId] = {clientId: clientBoard.clientid, balance: balance};
                                if (i + 1 === boards.length) {
                                    resolve(priceClients);
                                }
                            });
                        });
                    } else {
                        priceClients[boardId] = {};
                        this.addDefaultZincBoard(boardId, gameId, column);
                        if (i + 1 === boards.length) {
                            resolve(priceClients);
                        }
                    }
                });
            }
        }
    });
};

ClientBoard.getWinningBoards = async function (gameId) {
    return new Promise(resolve => {
        sequelize.query("SELECT clientboard.firstzinc, clientboard.secondzinc, clientboard.bingo, clientboard.boardid, (SELECT color FROM board WHERE id=clientboard.boardid) as color FROM clientboard WHERE (clientboard.firstzinc=true OR clientboard.secondzinc=true OR clientboard.bingo=true) AND gameid=" + gameId, {type: sequelize.QueryTypes.SELECT}).then(winningBoards => {
            resolve(winningBoards);
        });
    });
};

module.exports = ClientBoard;