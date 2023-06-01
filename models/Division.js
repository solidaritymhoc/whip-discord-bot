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
    /**
     * @type string
     */
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
    },
    /**
     * @type string
     */
    whip: {
      type: DataTypes.STRING,
    },
    /**
     * @type number
     */
    line: {
      type: DataTypes.INTEGER,
    },
    /**
     * @type string
     */
    url: {
      type: DataTypes.TEXT,
    },
    /**
     * The end date of the division. Defaults to 10PM GMT 3 days after creation.
     * @type moment
     */
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
    /**
     * @type boolean
     */
    first_reminder_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
    /**
     * @type boolean
     */
    second_reminder_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
    /**
     * @type string
     */
    lineText: {
      type: DataTypes.VIRTUAL,
      get() {
        switch (this.line) {
          case 4:
            return 'N/A';
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
    paranoid: false,
  });
};
