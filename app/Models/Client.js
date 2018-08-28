let Sequelize = require('sequelize');
let sequelize = require('../../vendor/Sequalize/index');
let SettingModel = require('./Setting');


let Client = sequelize.define('client', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING},
    balance: {type: Sequelize.FLOAT},
    active: {type: Sequelize.BOOLEAN, defaultValue: true},
    banned: {type: Sequelize.BOOLEAN, defaultValue: false},
    created_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
    updated_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
}, {
    timestamps: false,
    tableName: 'client'
});

Client.getActiveClients = async function (gameId) {
    return new Promise(resolve => {
        sequelize.query("SELECT " +
            "client.id, " +
            "    client.name, " +
            "    (SELECT count(clientboard.id) FROM clientboard WHERE clientboard.clientid=client.id AND clientboard.gameid='" + gameId + "') AS boardcount, " +
            "    client.balance " +
            "FROM " +
            "client " +
            "GROUP BY client.id", {type: sequelize.QueryTypes.SELECT}).then(boards => {
            resolve(boards);
        });
    });
};

Client.setBalances = async function (clientboards, column) {
    return new Promise((resolve) => {
        if (clientboards.length > 0) {
            SettingModel.getValueToFloat(column).then(price => {
                console.log(price);
                let pricePerClient = price / clientboards.length;
                let sqlString = '';
                for (let i = 0; i < clientboards.length; i++) {
                    if (i !== 0) {
                        sqlString += ' || ';
                    }
                    sqlString += ' id=' + clientboards[i].clientid;
                }
                sqlString = '(' + sqlString + ')';
                sequelize.query("UPDATE client SET balance=balance + " + pricePerClient + ' WHERE ' + sqlString + " RETURNING id, balance", {type: sequelize.QueryTypes.SELECT}).then((res) => {
                    resolve(res);
                });
            });
        }
    });
};

Client.buyBoard = async function (clientId, price) {
    return new Promise(resolve => {
        sequelize.query("UPDATE client SET balance=balance-" + price + " WHERE id=" + clientId + " RETURNING balance", {type: sequelize.QueryTypes.SELECT}).then(client => {
            resolve(client[0].balance);
        });
    });
};

Client.setBalance = async function (clientId, balance) {
    return new Promise(resolve => {
        sequelize.query("UPDATE client SET balance=" + balance + " WHERE id=" + clientId + " RETURNING balance", {type: sequelize.QueryTypes.SELECT}).then(client => {
            resolve(client[0].balance);
        });
    });
};

Client.addBalance = async function (clientId, balance) {
    return new Promise(resolve => {
        sequelize.query("UPDATE client SET balance=" + balance + " + balance WHERE id=" + clientId + " RETURNING balance", {type: sequelize.QueryTypes.SELECT}).then(client => {
            resolve(client[0].balance);
        });
    });
};

Client.getBalance = async function (clientId) {
    return new Promise(resolve => {
        this.findOne({
            where: {id: clientId},
            attributes: ['balance']
        }).then(client => {
            if (client) {
                resolve(client.balance);
            } else {
                resolve(false);
            }
        });
    });
};

module.exports = Client;