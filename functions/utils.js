/**
 * Parses vote into correct format for safety.
 *
 * @param vote The inputted vote.
 * @returns {string}
 */
const parseVote = (vote) => {
    vote = vote.toLowerCase();
    if (vote.includes('aye')) return 'aye';
    if (vote.includes('no')) return 'no';
    if (vote.includes('abst')) return 'abs';
    if (vote.startsWith('u/') || vote.startsWith('/u')) return 'proxy';
    return 'N/A';
};

const getRedditId = (url) => {
    const urlSegments = new URL(url).pathname.split('/');
    if (urlSegments[urlSegments.length - 1] === '') {
        urlSegments.pop();
    }
    const submissionId = urlSegments[urlSegments.length - 2];
    if (submissionId === null) return null;
    return submissionId;
};

class Division {
    constructor(id, url, comments) {
        this.id = id;
        this.url = url;
        this.comments = comments;
    }

    /**
     * Show only aye votes
     * @returns {*}
     */
    ayes() {
        return this.comments.filter(c => c[1] === 'aye');
    }

    /**
     * Show only no votes
     * @returns {*}
     */
    noes() {
        return this.comments.filter(c => c[1] === 'no');
    }

    /**
     * Show only abstentions
     * @returns {*}
     */
    abstentions() {
        return this.comments.filter(c => c[1] === 'abs');
    }
}

module.exports = {
    parseVote,
    Division,
    getRedditId,
};