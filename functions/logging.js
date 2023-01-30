const { discordDevLogChannelId, enableDevLog } = require('../config.json');
const app = require('../app.js');
const moment = require('moment-timezone');

const logLevels = {
    Critical: 'CRITICAL',
    Error: 'ERROR',
    Info: 'INFO',
    Event: 'EVENT',
};

/**
 * Tells you if the dev log is enabled.
 *
 * @returns boolean
 */
function devLogEnabled() {
    return enableDevLog;
}

/**
 * @param message
 * @param level
 * @returns {Promise<void>}
 */
async function logStringToDevChannel(message, level) {
    const channel = app.discordClient.channels.cache.get(discordDevLogChannelId);
    channel.send(`[${level}] ${moment().tz('Europe/London').toString()}: ${message}`);
}

module.exports = {
    logStringToDevChannel,
    logLevels,
    devLogEnabled,
};