const { Division } = require('../dbObjects');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { logStringToDevChannel, logLevels, isDevLogEnabled } = require('./logging');

/**
 * Remove expired divisions automatically.
 * @returns {Promise<null>}
 */
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
        if (isDevLogEnabled()) await logStringToDevChannel(`Destroying ${division.id}, expired`, logLevels.Event);
        await division.destroy();
    }

    console.log(`Destroyed ${count} divisions`);
}

/**
 * @param {Division} division
 * @returns {Promise<number|null>}
 */
async function issueReminderNotices(division) {
    if (!(division instanceof Division)) {
        return null;
    }

    return 0;
}

module.exports = {
    removeExpiredDivisions,
    issueReminderNotices,
};