let Sequelize = require('sequelize');
let sequelize = require('../../vendor/Sequalize/index');

let Setting = sequelize.define('setting', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING},
    value: {type: Sequelize.STRING},
    created_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
    updated_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
}, {
    timestamps: false,
    tableName: 'setting'
});

Setting.getValue = async function(name, lower = true) {
    return new Promise(resolve => {
        if(lower) {
            name = name.toLowerCase();
        }
        this.findOne({
            where: {
                name: name
            }
        }).then(config => {
            if (config) {
                resolve(config.value);
            } else {
                resolve(false);
            }
        });
    });
};

Setting.getValueToFloat = async function(name) {
    return new Promise(resolve => {
        this.getValue(name).then(value => {
            resolve(parseFloat(value));
        });
    });
};

Setting.getValueToInt = async function(name) {
    return new Promise(resolve => {
        this.getValue(name).then(value => {
            console.log(value);
            resolve(parseInt(value));
        });
    });
};

module.exports = Setting;