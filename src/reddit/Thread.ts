import { AppDataSource } from "../data-source";
import { Member } from "../entity/Member";
import { ValidVotes } from "../enums/ValidVotes";
import { VoteComment } from "./VoteComment";

const membersRepository = AppDataSource.getRepository(Member);

export class Thread {
    id: string;
    shortName: string;
    longName: string;
    url: string;
    comments: VoteComment[];

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

    public getCommentsByVote(whip: ValidVotes) {
        return this.comments.filter((vote) => vote.vote == whip).map(vote => vote.username);
    }

    public getAyes(): string[] {
        return this.getCommentsByVote(ValidVotes.Aye);
    }

    public getNoes(): string[] {
        return this.getCommentsByVote(ValidVotes.No);
    }

    public getAbstentions(): string[] {
        return this.getCommentsByVote(ValidVotes.Abstain);
    }

    public async getMembersNotVoted() {
        const memberUsernames = (await membersRepository.find()).map(member => member.redditUsername);
        const haveVoted = this.comments.map(comment => comment.username);
        const notVoted = memberUsernames.filter(username => !haveVoted.some(voted => username === voted));
        return notVoted;
    }
}