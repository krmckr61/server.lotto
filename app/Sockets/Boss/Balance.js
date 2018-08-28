let StaffModule = require('../StaffModule');
let ClientModel = require('../../Models/Client');


class Balance extends StaffModule {
    initListeners() {

        this.socket.on('setBalance', (data) => {
            if(data && data.balance && data.clientId) {
                ClientModel.setBalance(data.clientId, data.balance).then(balance => {
                    this.emitBalance(data.clientId, balance)
                });
            }
        });

        this.socket.on('addBalance', (data) => {
            if(data && data.balance && data.clientId) {
                ClientModel.addBalance(data.clientId, data.balance).then(balance => {
                    this.emitBalance(data.clientId, balance)
                });
            }
        });

    };
    emitBalance(clientId, balance) {
        this.io.to('client-' + clientId).emit('setBalance', balance);
        this.io.to('boss').emit('setBalance', {clientId: clientId, balance: balance});
    };
}

module.exports = Balance;