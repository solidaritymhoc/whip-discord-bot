/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('sequelize/types')} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('mps', {
        /**
         * Reddit username of MP
         * @type string
         */
        name: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        discord_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        paranoid: true,
        timestamps: true,
    });
};