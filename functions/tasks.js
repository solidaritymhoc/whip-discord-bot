const { Division } = require('../dbObjects');
const moment = require('moment-timezone');
const { Op } = require('sequelize');

async function removeExpiredDivisions() {
    const expiredDivisions = await Division.findAll({
       where: {
           end_date: {
               [Op.lt]: moment.now(),
           },
       },
    });

    if (expiredDivisions.length === 0) return null;
}

module.exports = {
    removeExpiredDivisions,
};