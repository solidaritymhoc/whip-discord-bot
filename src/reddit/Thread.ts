import { VoteComment } from "./VoteComment";

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
}