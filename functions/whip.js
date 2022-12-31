const { Mps } = require('../dbObjects');
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

async function getMpsDnv(division) {
    const solMps = (await Mps.findAll()).map(mp => mp.name);
    division.comments.forEach(c => {
        solMps.forEach(mp => {
            if (c[0] === mp) {
                const index = solMps.indexOf(mp);
                solMps.splice(index, 1);
            }
        });
    });
    console.log(solMps);
    return solMps;
}

module.exports = {
    getMpsAgainstWhip,
    getMpsComplyWhip,
    getMpsDnv,
};