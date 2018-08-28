let GameModel = require('../app/Models/Game');
let GameModule = require('../app/Modules/Game');
let ClientBoardModel = require('../app/Models/ClientBoard');

let Game = {
    id: null,
    takenBoards: [],
    firstZinc: false,
    secondZinc: false,
    bingo: false,
    boardpurchase: true,
    startDate: false
};

Game.setDefault = function () {
    this.id = null;
    this.takenBoards = [];
    this.firstZinc = false;
    this.secondZinc = false;
    this.bingo = false;
    this.boardpurchase = true;
    this.startDate = false;
};

Game.set = function (data) {
    this.setDefault();
    this.id = data.game.id;
    this.boardpurchase = data.game.boardpurchase;
    if (data && data.startDate) {
        this.startDate = data.startDate;
    }
    if (this.boards && this.boards.length > 0) {
        for (let i = 0; i < this.boards.length; i++) {
            this.takenBoards.push(this.boards[i].id);
        }
    }
};

Game.has = function () {
    if (this.id) {
        return true;
    } else {
        return false;
    }
};

Game.constructor = function () {
    GameModel.getActiveGame().then((game) => {
        if (game) {
            GameModule.getGameDetails(game).then(data => {
                ClientBoardModel.getZinc(game.id).then((res) => {
                    switch (res) {
                        case 'second':
                            this.secondZinc = true;
                            this.firstZinc = true;
                            break;
                        case 'first':
                            this.firstZinc = true;
                            break;
                    }
                });
                this.set(data);
            });
        } else {
            this.setDefault();
        }
    });
};

Game.isTaken = function (boardId) {
    if (this.takenBoards.indexOf(boardId) > -1) {
        return true;
    } else {
        return false;
    }
};

Game.constructor();

module.exports = Game;