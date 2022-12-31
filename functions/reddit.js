const { redditClientId, redditSecret, redditBotName, redditBotVer, redditBotUsername, redditBotPassword } = require('../config.json');
const snoowrap = require('snoowrap');
const { Mps } = require('../dbObjects');
const { parseVote, Division } = require('../functions/utils');

const r = new snoowrap({
    userAgent: `${redditBotName} version ${redditBotVer} by u/${redditBotUsername}`,
    clientId: redditClientId,
    clientSecret: redditSecret,
    username: redditBotUsername,
    password: redditBotPassword,
});

async function getDivisionVotes(redditId) {
    // Build division
    let division = null;
    try {
         division = new Division(
            await r.getSubmission(redditId).fetch().then(s => s.title.split(' - ')[0]),
            await r.getSubmission(redditId).fetch().then(s => s.url),
            await r.getSubmission(redditId).fetch().then(s => s.comments.map(c => [c.author.name, parseVote(c.body)]))
        );
    }
    catch (e) {
        console.log(e);
        return;
    }
    // Remove automod
    division.comments = division.comments.filter(c => (c[0] !== 'AutoModerator'));
    // Remove non-Solidarity MPs
    const solMps = (await Mps.findAll()).map(mp => mp.name);
    division.comments = division.comments.filter(c => (solMps.includes(c[0])));

    return division;
}

module.exports = {
    getDivisionVotes,
};