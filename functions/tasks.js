const { Division } = require('../dbObjects');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { logStringToDevChannel, logLevels, devLogEnabled } = require('./logging');
const { getMpsDnv } = require('./whip');
const { getDivisionVotes, findDivisionByUrl } = require('./reddit');
const { getRedditId } = require('./utils');
const escape = require('markdown-escape');
const { EmbedBuilder } = require('discord.js');
const app = require('../app');
const { discordWhipChannelId } = require('../config.json');
const momentFormat = 'dddd, MMMM Do YYYY, h:mm:ss a';

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
        if (devLogEnabled()) await logStringToDevChannel(`Destroying ${division.id}, expired`, logLevels.Event);
        await division.destroy();
    }

    console.log(`Destroyed ${count} divisions`);
}

/**
 * @param {Division} division
 * @returns {Promise<number|null>}
 */
async function issueReminderNotices() {
    const divisionsDue = await Division.findAll({
        where: {
            first_reminder_sent: {
                [Op.eq]: 0,
            },
        },
    });
    for (const division of divisionsDue) {
        const reminderTime = division.end_date.subtract(67, 'hours');
        if (moment().isAfter(reminderTime)) {
            console.log('yes');
            // Issue whip reminders
            const votes = await getDivisionVotes(getRedditId(division.url));
            const mpsToRemind = await getMpsDnv(votes);

            let embedDnvValue = '';
            mpsToRemind.forEach(mp => embedDnvValue += `${escape(mp)} \n`);
            if (embedDnvValue === '') embedDnvValue = 'None';

            const responseEmbed = new EmbedBuilder()
                .setTitle(`Reminder to vote on ${division.id}`)
                .setDescription(`${division.id} - ${division.url} - **${division.lineText} line ${division.whip.toString().toUpperCase()}**`)
                .addFields(
                    { name: 'MPs', value: embedDnvValue },
                )
                .setFooter({ text: `Sent at ${moment().format(momentFormat)}` });

            const channel = app.discordClient.channels.cache.get(discordWhipChannelId);
            await channel.send({ embeds: [responseEmbed] }).then(async () => {
                await division.update({ first_reminder_sent: true });
            });
        }
    }
    return 0;
}

module.exports = {
    removeExpiredDivisions,
    issueReminderNotices,
};