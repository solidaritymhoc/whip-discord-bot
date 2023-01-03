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

/**
 * Gets division from full Reddit URL.
 *
 * @param url
 * @returns {Promise<Division|null>}
 */
async function findDivisionByUrl(url) {
    const urlSegments = new URL(url).pathname.split('/');
    if (urlSegments[urlSegments.length - 1] === '') {
        urlSegments.pop();
    }
    const submissionId = urlSegments[urlSegments.length - 2];
    if (submissionId === null) return null;
    let division = null;
    try {
        division = new Division(
            await r.getSubmission(submissionId).fetch().then(s => s.title.split(' - ')[0]),
            await r.getSubmission(submissionId).fetch().then(s => s.url),
            await r.getSubmission(submissionId).fetch().then(s => s.comments.map(c => [c.author.name, parseVote(c.body)])),
        );
    }
    catch (e) {
        console.log(e);
        return null;
    }
    return division;
}

async function getDivisionVotes(redditId) {
    // Build division
    let division = null;
    try {
         division = new Division(
            await r.getSubmission(redditId).fetch().then(s => s.title.split(' - ')[0]),
            await r.getSubmission(redditId).fetch().then(s => s.url),
            await r.getSubmission(redditId).fetch().then(s => s.comments.map(c => [c.author.name, parseVote(c.body)])),
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

findDivisionByUrl('https://www.reddit.com/r/MHOCMP/comments/zp9y9j/b1458_equality_act_amendment_bill_division/');

module.exports = {
    getDivisionVotes,
    findDivisionByUrl,
};