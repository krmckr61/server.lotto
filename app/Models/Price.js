let Sequelize = require('sequelize');
let sequelize = require('../../vendor/Sequalize/index');

let Price = sequelize.define('price', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    boardprice: {type: Sequelize.STRING},
    firstzinc: {type: Sequelize.STRING},
    secondzinc: {type: Sequelize.STRING},
    bingo: {type: Sequelize.STRING},
    active: {type: Sequelize.BOOLEAN, defaultValue: true},
    created_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
    updated_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
}, {
    timestamps: false,
    tableName: 'price'
});

Price.getPrices = async function () {
    return new Promise(resolve => {
        this.findAll({
            where: {
                active: true
            }
        }).then(prices => {
            resolve(prices);
        });
    });
};

Price.getBoardPrice = async function (priceId) {
    return new Promise(resolve => {
        this.findOne({
            where: {
                id: priceId,
                active: true
            }
        }).then(price => {
            if(price) {
                resolve(price.boardprice);
            } else {
                resolve(false);
            }
        })
    });
};

Price.getZincPrice = async function (priceId, column) {
    return new Promise(resolve => {
        column = column.toLowerCase();
        this.findOne({
            where: {
                id: priceId,
                active: true
            }
        }).then(price => {
            if(price) {
                resolve(price[column]);
            } else {
                resolve(false);
            }
        })
    });
};


module.exports = Price;