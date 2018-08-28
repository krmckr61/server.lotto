let Sequelize = require('sequelize');
let sequelize = require('../../vendor/Sequalize/index');
let Game = require('./Game');
let Client = require('./Client');
let Board = require('./Board');

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
            if(zinc.length > 0) {
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
            if(clientboards.length > 0) {
                resolve(clientboards);
            } else {
                resolve(false);
            }
        });
    });
};

ClientBoard.buyBoard = async function (clientId, boardId, gameId, boardPrice) {
    return new Promise(resolve => {
        this.create({clientid: clientId, boardid: boardId, gameid: gameId}).then(clientBoard => {
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

module.exports = ClientBoard;