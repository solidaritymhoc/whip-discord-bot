const { redditClientId, redditSecret, redditBotName, redditBotVer, redditBotUsername, redditBotPassword } = require('../config.json');
const snoowrap = require('snoowrap');

const r = new snoowrap({
    userAgent: `${redditBotName} version ${redditBotVer} by u/${redditBotUsername}`,
    clientId: redditClientId,
    clientSecret: redditSecret,
    username: redditBotUsername,
    password: redditBotPassword,
});

module.exports = {

};