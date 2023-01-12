const { Division } = require('../dbObjects');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { logStringToDevChannel, logLevels } = require('./logging');

async function removeExpiredDivisions() {
    const expiredDivisions = await Division.findAll({
       where: {
           end_date: {
               [Op.lt]: moment.now(),
           },
       },
    });

    if (expiredDivisions.length === 0) return null;

    const count = expiredDivisions.length;

    for (const division of expiredDivisions) {
        console.log('test');
        await logStringToDevChannel(`Destroying ${division.id}, expired`, logLevels.Event);
        await division.destroy();
    }

    console.log(`Destroyed ${count} divisions`);
}

module.exports = {
    removeExpiredDivisions,
};