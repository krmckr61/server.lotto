let Sequelize = require('sequelize');
let sequelize = require('../../vendor/Sequalize/index');
let SettingModel = require('./Setting');
let ClientModel = require('./Client');

let Board = sequelize.define('board', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    view: {type: Sequelize.JSON},
    color: {type: Sequelize.STRING},
    firstrow: {type: Sequelize.ARRAY(Sequelize.INTEGER)},
    secondrow: {type: Sequelize.ARRAY(Sequelize.INTEGER)},
    thirdrow: {type: Sequelize.ARRAY(Sequelize.INTEGER)},
    created_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
    updated_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
}, {
    timestamps: false,
    tableName: 'board'
});

Board.zincSql = "UPDATE " +
    "   clientboard " +
    "   SET {column}=true " +
    "   FROM board " +
    "   WHERE " +
    "   clientboard.gameid={gameId} AND ";


Board.setIfHasZinc = async function (numbers, func) {
    return new Promise(resolve => {
        switch (func) {
            case 'firstZinc':
                resolve(this.firstZinc(numbers));
                break;
            case 'secondZinc':
                resolve(this.secondZinc(numbers));
                break;
            case 'bingo':
                resolve(this.bingo(numbers));
                break;
        }
    });
};

Board.firstZinc = async function (numbers, gameId) {
    return new Promise(resolve => {
        sequelize.query("SELECT board.id FROM board WHERE (" + numbers + " @> board.firstrow OR " + numbers + " @> board.secondrow OR " + numbers + " @> board.thirdrow)", {type: sequelize.QueryTypes.SELECT}).then(boards => {
            if(boards.length > 0) {
                resolve(boards);
            } else {
                resolve(false);
            }
        });
    });
};

Board.secondZinc = async function (numbers, gameId) {
    return new Promise(resolve => {
        sequelize.query("SELECT board.id FROM board WHERE ( (" + numbers + " @> board.firstrow AND " + numbers + " @> board.secondrow) OR (" + numbers + " @> board.firstrow AND " + numbers + " @> board.thirdrow) OR (" + numbers + " @> board.secondrow AND " + numbers + " @> board.thirdrow) )", {type: sequelize.QueryTypes.SELECT}).then(boards => {
            if(boards.length > 0) {
                resolve(boards);
            } else {
                resolve(false);
            }
        });
    });
};

Board.bingo = async function (numbers, gameId) {
    return new Promise(resolve => {
        sequelize.query("SELECT board.id FROM board WHERE (" + numbers + " @> board.firstrow AND " + numbers + " @> board.secondrow AND " + numbers + " @> board.thirdrow)", {type: sequelize.QueryTypes.SELECT}).then(boards => {
            if(boards.length > 0) {
                resolve(boards);
            } else {
                resolve(false);
            }
        });
    });
};


module.exports = Board;