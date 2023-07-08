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
exports.ProxyCommand = void 0;
const plugin_subcommands_1 = require("@sapphire/plugin-subcommands");
const data_source_1 = require("../data-source");
const Proxy_1 = require("../entity/Proxy");
const discord_js_1 = require("discord.js");
const Formatters_1 = require("../utilities/Formatters");
const Member_1 = require("../entity/Member");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class ProxyCommand extends plugin_subcommands_1.Subcommand {
    constructor(context, options) {
        super(context, Object.assign(Object.assign({}, options), { name: 'proxy', description: 'Proxy management', subcommands: [
                {
                    name: 'list',
                    chatInputRun: 'chatInputList'
                },
                {
                    name: 'add',
                    chatInputRun: 'chatInputAdd',
                },
                {
                    name: 'remove',
                    chatInputRun: 'chatInputRemove',
                }
            ] }));
        this.proxyRepository = data_source_1.AppDataSource.getRepository(Proxy_1.Proxy);
        this.memberRepository = data_source_1.AppDataSource.getRepository(Member_1.Member);
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder //
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((command) => command.setName('list').setDescription('List all members'))
            .addSubcommand((command) => command
            .setName('add')
            .setDescription('Add a new member')
            .addStringOption((option) => option
            .setName('member')
            .setDescription('The member being proxied')
            .setRequired(true)
            .setAutocomplete(true))
            .addStringOption((option) => option
            .setName('agent')
            .setDescription('The agent for the proxy')
            .setRequired(true)
            .setAutocomplete(true))
            .addIntegerOption(option => option.setName('days_ends_in').setRequired(true).setDescription('Days duration of the proxy')))
            .addSubcommand((command) => command
            .setName('remove')
            .setDescription('Deactivate a proxy')
            .addStringOption((option) => option
            .setName('proxy')
            .setDescription('The username of the member being proxied')
            .setRequired(true)
            .setAutocomplete(true))), { idHints: ['1119864466968948736'] });
    }
    chatInputList(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const proxies = yield this.proxyRepository.find({
                relations: { member: true, agent: true }
            });
            if (proxies.length == 0) {
                interaction.reply('No proxies active.');
                return;
            }
            const responseEmbed = new discord_js_1.EmbedBuilder()
                .setTitle('Active proxies');
            for (const proxy of proxies) {
                responseEmbed.addFields({
                    name: proxy.member.redditUsername,
                    value: `By ${proxy.agent.redditUsername} until ${(0, Formatters_1.formatDate)(proxy.expiresAt)}`
                });
            }
            yield interaction.reply({ embeds: [responseEmbed] });
        });
    }
    chatInputAdd(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const memberName = interaction.options.getString('member');
            const agentName = interaction.options.getString('agent');
            const daysEndsIn = interaction.options.getInteger('days_ends_in');
            if ((!memberName || !agentName) || (memberName == agentName) || !daysEndsIn) {
                yield interaction.reply('A value is missing that is required, or if you did provide them, they must be unique.');
                return;
            }
            const member = yield this.memberRepository.findOneBy({ redditUsername: memberName });
            const agent = yield this.memberRepository.findOneBy({ redditUsername: agentName });
            if (!member || !agent) {
                yield interaction.reply('Member or agent not found.');
                return;
            }
            const proxy = new Proxy_1.Proxy();
            proxy.expiresAt = (0, moment_timezone_1.default)().add(daysEndsIn, 'days').hour(22).minute(0).second(0).toDate();
            proxy.member = member;
            proxy.agent = agent;
            yield this.proxyRepository.save(proxy);
            yield interaction.reply({ content: `Added new proxy for ${proxy.member.redditUsername}!` });
        });
    }
    chatInputRemove(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const memberName = interaction.options.getString('proxy');
            if (!memberName) {
                yield interaction.reply('A value is missing that is required, or if you did provide them, they must be unique.');
                return;
            }
            const proxy = yield this.proxyRepository.createQueryBuilder("proxy")
                .leftJoinAndSelect("proxy.member", "member")
                .where("member.redditUsername = :redditUsername", { redditUsername: memberName })
                .getOne();
            console.log(proxy);
        });
    }
}
exports.ProxyCommand = ProxyCommand;
