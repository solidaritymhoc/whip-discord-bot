const { redditClientId, redditSecret, redditBotName, redditBotVer, redditBotUsername, redditBotPassword } = require('../config.json');
const snoowrap = require('snoowrap');
const { Mps } = require('../dbObjects');

const r = new snoowrap({
    userAgent: `${redditBotName} version ${redditBotVer} by u/${redditBotUsername}`,
    clientId: redditClientId,
    clientSecret: redditSecret,
    username: redditBotUsername,
    password: redditBotPassword,
});

async function getDivisionVotes() {
    const redditId = 'zp9y9j';
    // Build division
    const division = {
        id: await r.getSubmission(redditId).fetch().then(s => s.title.split(' - ')[0]),
        url: await r.getSubmission(redditId).fetch().then(s => s.url),
        comments: await r.getSubmission(redditId).fetch().then(s => s.comments.map(c => [c.author.name, c.body])),
    };
    // Remove automod
    division.comments = division.comments.filter(c => (c[0] !== 'AutoModerator'));
    // Remove non-Solidarity MPs
    const solMps = (await Mps.findAll()).map(mp => mp.name); /* cocoiadrop_ only */
    division.comments = division.comments.filter(c => (solMps.includes(c[0])));
    console.log(division);
}

getDivisionVotes();

module.exports = {
    getDivisionVotes,
};