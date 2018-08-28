let dbConf = require('../../config/database');
let Sequelize = require('sequelize');

let sequelize = new Sequelize(dbConf.database, dbConf.user, dbConf.password, {

    dialect: 'postgres',

    host: dbConf.host,

    port: dbConf.port,

    operatorsAliases: false,

    logging: console.log,

});

module.exports = sequelize;