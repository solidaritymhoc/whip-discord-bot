// Import libraries and functions
const snoowrap = require('snoowrap');
const config = require('config');
const { Mps } = require('../dbObjects');
const { parseVote, Division } = require('../functions/utils');
const { getRedditId } = require('./utils');

// Configuration
const r = new snoowrap({
    userAgent: `${config.get('reddit.botName')} version ${config.get('reddit.botVersion')} by u/${config.get('reddit.botUsername')}`,
    clientId: config.get('reddit.clientId'),
    clientSecret: config.get('reddit.secret'),
    username: config.get('reddit.botUsername'),
    password: config.get('reddit.botPassword'),
});

/**
 * Gets division from full Reddit URL.
 *
 * @param url
 * @returns {Promise<Division|null>}
 */
async function findDivisionByUrl(url) {
    const submissionId = getRedditId(url);
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

module.exports = {
    getDivisionVotes,
    findDivisionByUrl,
};