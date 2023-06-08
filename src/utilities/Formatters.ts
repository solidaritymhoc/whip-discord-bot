import moment from "moment-timezone";
import { ValidVotes } from "../enums/ValidVotes";
import { Colors } from "discord.js";

export const momentFormat = 'dddd, MMMM Do YYYY, h:mm:ss a';

export function formatDate(date: Date) {
    return moment(date).format(momentFormat);
}

export function commentToVoteEnum(comment: string): ValidVotes | null {
    comment = comment.toLowerCase();
    if (comment.includes('aye')) return ValidVotes.Aye;
    else if (comment.includes('no')) return ValidVotes.No;
    else if (comment.includes('abs')) return ValidVotes.Abstain;
    else return null;
}

export function voteColour(vote: ValidVotes) {
    switch (vote) {
        case ValidVotes.Aye:
            return Colors.Green;
        case ValidVotes.No:
            return Colors.Red;
        case ValidVotes.Abstain: 
            return Colors.Yellow;
        case ValidVotes.Free:
            return Colors.Greyple; 
    }
}