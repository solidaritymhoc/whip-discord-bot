"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidJson = exports.voteColour = exports.commentToVoteEnum = exports.formatDate = exports.momentFormat = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const ValidVotes_1 = require("../enums/ValidVotes");
const discord_js_1 = require("discord.js");
exports.momentFormat = 'dddd, MMMM Do YYYY, h:mm:ss a';
function formatDate(date) {
    return (0, moment_timezone_1.default)(date).format(exports.momentFormat);
}
exports.formatDate = formatDate;
function commentToVoteEnum(comment) {
    comment = comment.toLowerCase();
    if (comment.includes('aye'))
        return ValidVotes_1.ValidVotes.Aye;
    else if (comment.includes('no'))
        return ValidVotes_1.ValidVotes.No;
    else if (comment.includes('abs'))
        return ValidVotes_1.ValidVotes.Abstain;
    else
        return null;
}
exports.commentToVoteEnum = commentToVoteEnum;
function voteColour(vote) {
    switch (vote) {
        case ValidVotes_1.ValidVotes.Aye:
            return discord_js_1.Colors.Green;
        case ValidVotes_1.ValidVotes.No:
            return discord_js_1.Colors.Red;
        case ValidVotes_1.ValidVotes.Abstain:
            return discord_js_1.Colors.Yellow;
        case ValidVotes_1.ValidVotes.Free:
            return discord_js_1.Colors.Greyple;
    }
}
exports.voteColour = voteColour;
function isValidJson(input) {
    try {
        JSON.parse(input);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.isValidJson = isValidJson;
