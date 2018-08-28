let StaffModule = require('../StaffModule');
let ClientModel = require('../../Models/Client');
let ClientBoardModel = require('../../Models/ClientBoard');
let GameModel = require('../../Models/Game');
let GameModule = require('../../Modules/Game');
let GameData = require('../../../data/Game');

/*
 * this.socket
 * this.io
 */

class Connection extends StaffModule {
    initListeners() {
        this.connection();
    };

    connection() {
        this.initRooms();

        this.initPage();
    };

    initPage() {
        this.getGameInfos().then(data => {
            GameModule.initStaffPage(data, this.socket);
        });
    };
    async getGameInfos() {
        return new Promise(resolve => {
            GameModel.getActiveGame().then(game => {
                resolve(GameModule.getGameDetails(game, GameData.startDate));
            });
        })
    };
}

module.exports = Connection;