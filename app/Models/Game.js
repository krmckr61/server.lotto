let Sequelize = require('sequelize');
let sequelize = require('../../vendor/Sequalize/index');
let ClientBoardModel = require('./ClientBoard');

let Game = sequelize.define('game', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    active: {type: Sequelize.BOOLEAN, defaultValue: true},
    boardpurchase: {type: Sequelize.BOOLEAN, defaultValue: true},
    created_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
    updated_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
}, {
    timestamps: false,
    tableName: 'game'
});

Game.getActiveGame = async function () {
    return new Promise(resolve => {
        this.findOne({
            where: {
                active: true
            }
        }).then(game => {
            if (game) {
                resolve(game);
            } else {
                resolve(false);
            }
        });
    });
};

Game.newGame = async function () {
    return new Promise(resolve => {
        this.create({}).then(game => {
            resolve(game);
        })
    });
};

Game.stopBoardPurchase = async function () {
    return new Promise(resolve => {
        this.update({boardpurchase: false}, {where: {active: true}}).then(() => {
            resolve(true);
        });
    });
};

Game.endGame = async function () {
    return new Promise(resolve => {
        this.update({active: false}, {where: {active: true}}).then(() => {
            resolve(true);
        });
    });
};

Game.getLastGameWinners = async function () {
    return new Promise(resolve => {
        sequelize.query("SELECT id FROM game WHERE active=false ORDER BY id DESC LIMIT 1", {type: sequelize.QueryTypes.SELECT}).then(games => {
            if (games.length > 0) {
                let gameId = games[0].id;
                sequelize.query("SELECT clientboard.*, client.name FROM clientboard INNER JOIN client ON clientboard.clientid=client.id WHERE clientboard.gameid=" + gameId + " AND (clientboard.firstzinc=true OR clientboard.secondzinc=true OR clientboard.bingo=true)", {type: sequelize.QueryTypes.SELECT}).then(rows => {
                    resolve(rows);
                });
            } else {
                resolve(false);
            }
        });
    });
};

module.exports = Game;