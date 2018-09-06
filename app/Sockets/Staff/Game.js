/*
 * this.socket
 * this.io
 */

let StaffModule = require('../StaffModule');
let GameModel = require('../../Models/Game');
let GameModule = require('../../Modules/Game');
let GameData = require('../../../data/Game');
let BoardModel = require('../../Models/Board');
let ClientModel = require('../../Models/Client');
let ClientBoardModel = require('../../Models/ClientBoard');
let NumberData = require('../../../data/Number');
let SettingModel = require('../../Models/Setting');
let moment = require('moment');

class Game extends StaffModule {
    initListeners() {

        this.socket.on('startGame', (startDate) => {
            if (!GameData.has() && startDate) {
                GameModel.newGame().then(game => {
                    GameModule.getGameDetails(game).then(data => {
                        SettingModel.getValue('boardTakingTime', false).then(boardTakingTime => {
                            data.startDate = moment(startDate).add(boardTakingTime, 'seconds').format('YYYY-MM-DD HH:mm:ss');
                            GameData.set(data);
                            data.numbers = NumberData.numbers;
                            GameModule.initStaffPage(data, this.socket);
                            GameModule.initClientPage(data, this.io);
                        });
                    });
                });
            } else {
                this.socket.emit('errorMessage', {message: 'Mevcut oyunu sonlandırmadan yeni oyuna başlayamazsınız.'});
            }
        });

        this.socket.on('stopBoardPurchase', () => {
            if (GameData.has() && GameData.boardpurchase === true) {
                GameData.boardpurchase = false;
                GameData.startDate = false;
                GameModel.stopBoardPurchase().then(() => {
                    this.socket.emit('stoppedBoardPurchase');
                });
                this.io.to('client').emit('stopBoardPurchase');
            } else {
                this.socket.emit('errorMessage', {message: 'Kart alımı sonlandırılacak oyun bulunamadı.'});
            }
        });

        this.socket.on('endGame', () => {
            if (GameData.has()) {
                NumberData.clear();
                GameData.setDefault();
                GameModel.endGame().then(() => {
                    GameModule.getGameDetails(false).then(data => {
                        GameModule.initStaffPage(data, this.socket);
                    });
                });
                this.io.to('client').emit('endGame', {});
            } else {
                this.socket.emit('errorMessage', {message: 'Sonlandırılacak oyun bulunamadı.'});
            }
        });

        this.socket.on('number', (number) => {
            if (GameData.has()) {
                if (!NumberData.has(number)) {
                    NumberData.add(number);

                    this.io.to('client').emit('number', number);

                    let column = 'firstZinc';

                    if (GameData.secondZinc === true) {
                        column = 'bingo';
                    } else if (GameData.firstZinc === true) {
                        column = 'secondZinc';
                    }

                    BoardModel.setIfHasZinc(NumberData.toString(), column).then(boards => {
                        if (boards) {
                            ClientBoardModel.setZincs(boards, GameData.id, column).then(clients => {
                                if (Object.keys(clients).length > 0) {
                                    GameData[column] = true;
                                    this.io.to('client').emit(column, boards);
                                    Object.keys(clients).forEach(key => {
                                        let client = clients[key];
                                        if(client && client.balance) {
                                            this.io.to('client-' + client.clientId).emit('setBalance', client.balance);
                                        }

                                        if (column === 'bingo') {
                                            GameData.setDefault();
                                            NumberData.clear();
                                            GameModel.endGame().then((end) => {
                                                GameModule.initStaffPage({}, this.socket);
                                                GameModule.initClientPage({}, this.socket);
                                            });
                                        }
                                        this.socket.emit(column, boards);
                                    });
                                } else {
                                    console.log('YOKK');
                                }
                            });


                            // ClientModel.setBalances(boards, GameData.id, column).then((clients) => {
                            //     if (clients.length > 0) {
                            //         for (let i = 0; i < clients.length; i++) {
                            //             let client = clients[i];
                            //             this.io.to('client-' + client.id).emit('setBalance', client.balance);
                            //         }
                            //     }
                            //
                            //     this.io.to('client').emit(column, boards);
                            //     GameData[column] = true;
                            //     if (column === 'bingo') {
                            //         GameData.setDefault();
                            //         NumberData.clear();
                            //         GameModel.endGame().then((end) => {
                            //             GameModule.initStaffPage({}, this.socket);
                            //             GameModule.initClientPage({}, this.socket);
                            //         });
                            //     }
                            //     this.socket.emit(column, boards);
                            // });
                        }
                    });

                } else {
                    this.socket.emit('errorMessage', {message: 'Bu numara daha önceden girilmiş.'});
                }
            } else {
                this.socket.emit('errorMessage', {message: 'Henüz bir oyun başlatmadınız.'});
            }
        });

        this.socket.on('setLastGame', () => {
            GameModel.getLastGameWinners().then(lastGame => {
                this.socket.emit('getLastGame', lastGame);
            });
        });

    };
}

module.exports = Game;