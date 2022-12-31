const { Division } = require('../functions/utils');
const acceptableWhips = ['aye', 'no', 'abs'];

/**
 * @param division Division object to be checked
 * @param whip The whip string.
 * @returns {*|null}
 */
function getMpsAgainstWhip(division, whip) {
    if (!(division instanceof Division)) return null;
    if (!acceptableWhips.includes(whip)) return null;
    let votes = division.comments;
    votes = votes.filter(vote => vote[1] !== whip);
    return votes;
}

function getMpsComplyWhip(division, whip) {
    if (!(division instanceof Division)) return null;
    if (!acceptableWhips.includes(whip)) return null;
    let votes = division.comments;
    votes = votes.filter(vote => vote[1] === whip);
    return votes;
}

module.exports = {
    getMpsAgainstWhip,
    getMpsComplyWhip
};