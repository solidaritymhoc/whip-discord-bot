import { ValidVotes } from "../enums/ValidVotes";

export class VoteComment {
    public username: string;
    public vote: ValidVotes;
    
    public constructor(username: string, vote: ValidVotes) {
        this.username = username;
        this.vote = vote;
    }
}