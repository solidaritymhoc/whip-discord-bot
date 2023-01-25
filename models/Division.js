const moment = require('moment-timezone');
/**
* @typedef {import('sequelize').Sequelize} Sequelize
* @typedef {import('sequelize/types')} DataTypes
*/
/**
* @param {DataTypes} DataTypes
* @param {Sequelize} sequelize
* @param {string} id
* @param {string} whip 
* @param {number} line 
* @param {string} url
* @param {moment} end_date 
* @param {boolean} first_reminder_sent
* @param {boolean} second_reminder_sent
* @param {DataTypes.VIRTUAL} lineText
*/
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('divisions', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        whip: {
            type: DataTypes.STRING,
        },
        line: {
            type: DataTypes.INTEGER,
        },
        url: {
            type: DataTypes.TEXT,
        },
        end_date: {
            type: DataTypes.DATE,
            get() {
                const date = this.getDataValue('end_date');
                return date ? moment(date) : null;
            },
            set(value) {
                if (value instanceof moment) {
                    this.setDataValue('end_date', value.toDate());
                }
                else {
                    this.setDataValue('end_date', value);
                }
            },
        },
        first_reminder_sent: {
            type: DataTypes.BOOLEAN,
            nullable: true,
        },
        second_reminder_sent: {
            type: DataTypes.BOOLEAN,
            nullable: true,
        },
        lineText: {
            type: DataTypes.VIRTUAL,
            get() {
                switch (this.line) {
                    case 0:
                        return 'No';
                    case 1:
                        return 'One';
                    case 2:
                        return 'Two';
                    case 3:
                        return 'Three';
                }
            },
            set() {
                throw new Error('Do not try to set the `lineText` value!');
            },
        },
    }, {
        timestamps: true,
        paranoid: true,
    });
};