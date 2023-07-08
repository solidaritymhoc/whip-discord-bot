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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchThread = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const whipConfig_json_1 = __importDefault(require("../whipConfig.json"));
const snoowrap_1 = __importDefault(require("snoowrap"));
const Thread_1 = require("./Thread");
const framework_1 = require("@sapphire/framework");
const VoteComment_1 = require("./VoteComment");
const Formatters_1 = require("../utilities/Formatters");
const data_source_1 = require("../data-source");
const Member_1 = require("../entity/Member");
const ignore = [
    'AutoModerator'
];
const membersRepository = data_source_1.AppDataSource.getRepository(Member_1.Member);
const api = new snoowrap_1.default({
    userAgent: 'Solidarity Whip Bot version 2.0.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
});
function threadIdFromUrl(url) {
    const urlSegments = new URL(url).pathname.split('/');
    if (urlSegments[urlSegments.length - 1] === '') {
        urlSegments.pop();
    }
    return urlSegments[urlSegments.length - 2];
}
function fetchThread(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = threadIdFromUrl(url);
        const thread = new Thread_1.Thread();
        thread.id = id;
        thread.url = url;
        const memberUsernames = (yield membersRepository.find()).map(member => member.redditUsername);
        // Fill title and comments
        try {
            yield api.getSubmission(id).fetch()
                .then(response => {
                // Short and long title
                const split = response.title.split(whipConfig_json_1.default.titleSeperator);
                thread.shortName = split[0].trim();
                thread.longName = split[1].trim();
                if (split.length == 3) {
                    thread.longName += ` (${split[2].trim()})`;
                }
                // Comments
                thread.comments = [];
                response.comments.forEach(Comment => {
                    if ((ignore.includes(Comment.author.name)) || !(memberUsernames.includes(Comment.author.name))) {
                        return;
                    }
                    const voteEnum = (0, Formatters_1.commentToVoteEnum)(Comment.body);
                    if (!voteEnum)
                        return;
                    thread.comments.push(new VoteComment_1.VoteComment(Comment.author.name, voteEnum));
                });
            });
        }
        catch (e) {
            framework_1.container.logger.error(e);
            return null;
        }
        return thread;
    });
}
exports.fetchThread = fetchThread;
