"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thread = void 0;
const data_source_1 = require("../data-source");
const Member_1 = require("../entity/Member");
const ValidVotes_1 = require("../enums/ValidVotes");
const membersRepository = data_source_1.AppDataSource.getRepository(Member_1.Member);
class Thread {
    // constructor(
    //     id: string,
    //     short: string,
    //     long: string,
    //     url: string,
    //     comments: VoteComment[]
    // ) {
    //     id = id;
    //     short = short;
    //     long = long;
    //     url = url;
    //     comments = comments;
    // }
    getCommentsByVote(whip) {
        return this.comments.filter((vote) => vote.vote == whip).map(vote => vote.username);
    }
    getAyes() {
        return this.getCommentsByVote(ValidVotes_1.ValidVotes.Aye);
    }
    getNoes() {
        return this.getCommentsByVote(ValidVotes_1.ValidVotes.No);
    }
    getAbstentions() {
        return this.getCommentsByVote(ValidVotes_1.ValidVotes.Abstain);
    }
    getMembersNotVoted() {
        return __awaiter(this, void 0, void 0, function* () {
            const memberUsernames = (yield membersRepository.find()).map(member => member.redditUsername);
            const haveVoted = this.comments.map(comment => comment.username);
            const notVoted = memberUsernames.filter(username => !haveVoted.some(voted => username.toLowerCase() === voted.toLowerCase()));
            return notVoted;
        });
    }
}
exports.Thread = Thread;
