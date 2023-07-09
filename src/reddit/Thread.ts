import { IsNull, LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../data-source";
import { Member } from "../entity/Member";
import { ValidVotes } from "../enums/ValidVotes";
import { VoteComment } from "./VoteComment";
import { Dayjs } from "dayjs";

const membersRepository = AppDataSource.getRepository(Member);

export class Thread {
    id: string;
    shortName: string;
    longName: string;
    url: string;
    postedAt: Dayjs;
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
        const members = await membersRepository.find({
            relations: { activeProxy: true },
            where: [
                { phaseOutFrom: MoreThan(this.postedAt.toDate()) },
                { phaseOutFrom: IsNull() },
            ]
        });
        const haveVoted = this.comments.map(comment => comment.username);
        const notVoted = members.map(member => member.redditUsername).filter(username => !haveVoted.some(voted => username === voted));
        return notVoted;
    }
}