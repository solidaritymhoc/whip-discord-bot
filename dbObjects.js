const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

/**
* @typedef {import('sequelize').Sequelize} Sequelize
* @typedef {import('sequelize/types')} DataTypes
*/

/**
* @param {DataTypes} DataTypes
* @param {Sequelize} Sequelize
* @returns
*/
const Mps = require('./models/Mps.js')(sequelize, Sequelize.DataTypes);

/**
* @param {DataTypes} DataTypes
* @param {Sequelize} Sequelize
* @returns
*/
const Division = require('./models/Division')(sequelize, Sequelize.DataTypes);
//
// Reflect.defineProperty(Mps.prototype, 'getItems', {
//    value: () => {
//      return MpsItems.findAll({
//
//      })
//    },
// });

module.exports = { Division, Mps };