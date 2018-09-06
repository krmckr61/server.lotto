let ClientModule = require('../ClientModule');
let GameData = require('../../../data/Game');
let ClientBoardModel = require('../../Models/ClientBoard');
let ClientModel = require('../../Models/Client');
let SettingModel = require('../../Models/Setting');
let PriceModel = require('../../Models/Price');

/*
 * this.socket
 * this.io
 */

class Game extends ClientModule {
    initListeners() {
        this.socket.on('buyBoard', (data) => {
            let boardId = data.boardId;
            let priceId = data.priceId;

            if (GameData.boardpurchase) {
                ClientModel.getBalance(this.clientId).then(balance => {
                    if(balance) {
                        PriceModel.getBoardPrice(priceId).then(boardPrice => {
                            if(balance >= boardPrice) {
                                if (!GameData.isTaken(boardId)) {
                                    GameData.takenBoards.push(boardId);
                                    this.room().emit('boardBuyed', boardId);
                                    this.clientRoom().emit('addBoard', boardId);
                                    ClientBoardModel.buyBoard(this.clientId, boardId, GameData.id, boardPrice, priceId).then(balance => {
                                        this.clientRoom().emit('setBalance', balance);
                                        this.io.to('boss').emit('setBalance', {clientId: this.clientId, balance: balance});
                                        ClientBoardModel.getWithClientName(boardId, GameData.id).then(clientBoard => {
                                            this.io.to('staff').emit('boardBuyed', clientBoard);
                                        });
                                    });
                                } else {
                                    this.clientRoom().emit('errorMessage', 'Bu kart başkası tarafından satın alınmış.');
                                }
                            } else {
                                this.clientRoom().emit('errorMessage', 'Kart satın almak için bakiyeniz yetersiz.');
                            }
                        });
                    } else {
                        this.clientRoom().emit('errorMessage', 'Kart satın almak için bakiyeniz yetersiz.');
                    }
                });
            } else {
                this.clientRoom().emit('errorMessage', 'Kart alımı kapatıldığından bu kartı satın alamadınız.');
            }
        });

        this.socket.on('getZinc', (zinc) => {
            if(GameData.has()) {
                ClientBoardModel.getGameZinc(zinc, GameData.id).then(clientboards => {
                    if(clientboards) {
                        this.clientRoom().emit('showZinc', {zinc: zinc, boards: clientboards});
                    } else {
                        this.clientRoom().emit('errorMessage', 'Henüz gerçekleşmedi.');
                    }
                });
            } else {
                this.clientRoom().emit('errorMessage', 'Henüz bir oyun mevcut değil.');
            }
        });

    };
}

module.exports = Game;