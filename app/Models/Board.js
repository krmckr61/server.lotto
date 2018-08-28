let Sequelize = require('sequelize');
let sequelize = require('../../vendor/Sequalize/index');

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


Board.setIfHasZinc = async function (numbers, boardId, func) {
    return new Promise(resolve => {
        switch (func) {
            case 'firstZinc':
                resolve(this.firstZinc(numbers, boardId));
                break;
            case 'secondZinc':
                resolve(this.secondZinc(numbers, boardId));
                break;
            case 'bingo':
                resolve(this.bingo(numbers, boardId));
                break;
        }
    });
};

Board.firstZinc = async function (numbers, gameId) {
    return new Promise(resolve => {
        let sql = this.zincSql.replace('{column}', 'firstzinc');
        sql = sql.replace('{gameId}', gameId);
        sequelize.query(sql +
            "   (" +
            "       " + numbers + " @> board.firstrow OR " + numbers + " @> board.secondrow OR " + numbers + " @> board.thirdrow" +
            "   ) RETURNING clientboard.boardid, clientboard.clientid", {type: sequelize.QueryTypes.SELECT, returning: true}).then(boards => {
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
        let sql = this.zincSql.replace('{column}', 'secondzinc');
        sql = sql.replace('{gameId}', gameId);
        sequelize.query(sql +
            "   (" +
            "       (" + numbers + " @> board.firstrow AND " + numbers + " @> board.secondrow) OR " +
            "       (" + numbers + " @> board.firstrow AND " + numbers + " @> board.thirdrow) OR " +
            "       (" + numbers + " @> board.secondrow AND " + numbers + " @> board.thirdrow) " +
            "   ) RETURNING clientboard.boardid, clientboard.clientid", {type: sequelize.QueryTypes.SELECT, returning: true}).then(boards => {
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
        let sql = this.zincSql.replace('{column}', 'bingo');
        sql = sql.replace('{gameId}', gameId);
        sequelize.query(sql +
            "   (" +
            "       " + numbers + " @> board.firstrow AND " + numbers + " @> board.secondrow AND " + numbers + " @> board.thirdrow" +
            "   ) RETURNING clientboard.boardid, clientboard.clientid", {type: sequelize.QueryTypes.SELECT, returning: true}).then(boards => {
            if(boards.length > 0) {
                resolve(boards);
            } else {
                resolve(false);
            }
        });
    });
};


module.exports = Board;