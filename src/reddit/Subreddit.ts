import { config } from "dotenv";
config()
import whipConfig from "../whipConfig.json";
import Snoowrap from "snoowrap";
import { Thread } from "./Thread";
import { container } from "@sapphire/framework";
import { VoteComment } from "./VoteComment";
import { commentToVoteEnum } from "../utilities/Formatters";
import { AppDataSource } from "../data-source";
import { Member } from "../entity/Member";

const ignore: string[] = [
    'AutoModerator'
];

const membersRepository = AppDataSource.getRepository(Member);

const api = new Snoowrap({
    userAgent: 'Solidarity Whip Bot version 2.0.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
});

function threadIdFromUrl(url: string) {
    const urlSegments = new URL(url).pathname.split('/');
    if (urlSegments[urlSegments.length - 1] === '') {
        urlSegments.pop();
    }
    return urlSegments[urlSegments.length - 2];
}

export async function fetchThread(url: string) {
    const id = threadIdFromUrl(url);    
    const thread = new Thread();
    thread.id = id;
    thread.url = url;
    const memberUsernames = (await membersRepository.find()).map(member => member.redditUsername);

    // Fill title and comments
    try { 
    await api.getSubmission(id).fetch()
        .then(response => {
            // Short and long title
            const split = response.title.split(whipConfig.titleSeperator);
            thread.shortName = split[0].trim();
            thread.longName = split[1].trim();
            if (split.length == 3) {
                thread.longName += ` (${split[2].trim()})`
            }

            // Comments
            thread.comments = [];
            response.comments.forEach(Comment => {
                if ((ignore.includes(Comment.author.name)) || !(memberUsernames.includes(Comment.author.name))) {
                    return;
                }
                const voteEnum = commentToVoteEnum(Comment.body);
                if (!voteEnum) return;
                thread.comments.push(new VoteComment(Comment.author.name, voteEnum))
            });
        });
    }
    catch (e) {
        container.logger.error(e);
        return null;
    }

    return thread;
}