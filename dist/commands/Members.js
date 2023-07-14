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
exports.MembersCommand = void 0;
const plugin_subcommands_1 = require("@sapphire/plugin-subcommands");
const data_source_1 = require("../data-source");
const Member_1 = require("../entity/Member");
const discord_js_1 = require("discord.js");
const dayjs_1 = __importDefault(require("dayjs"));
class MembersCommand extends plugin_subcommands_1.Subcommand {
    constructor(context, options) {
        super(context, Object.assign(Object.assign({}, options), { name: 'members', description: 'Members management', subcommands: [
                {
                    name: 'list',
                    chatInputRun: 'chatInputList',
                },
                {
                    name: 'add',
                    chatInputRun: 'chatInputAdd',
                },
                {
                    name: 'remove',
                    chatInputRun: 'chatInputRemove',
                },
                {
                    name: 'reminder-channels',
                    chatInputRun: 'chatInputReminderChannels',
                },
                {
                    name: 'import',
                    chatInputRun: 'chatInputImport',
                },
                {
                    name: 'phase-out',
                    chatInputRun: 'chatInputPhaseOut'
                },
            ] }));
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
            .setName('reddit-username')
            .setDescription('The member\'s reddit username, without the u/. **CASE SENSITIVE**')
            .setRequired(true))
            .addUserOption((option) => option
            .setName('discord-user')
            .setDescription('The member\'s Discord account')
            .setRequired(false)))
            .addSubcommand((command) => command
            .setName('remove')
            .setDescription('Remove a member')
            .addStringOption((option) => option
            .setName('member')
            .setDescription('The member')
            .setRequired(true)
            .setAutocomplete(true)))
            .addSubcommand((command) => command
            .setName('reminder-channels')
            .setDescription('Set the member\'s reminder channels')
            .addStringOption((option) => option
            .setName('member')
            .setDescription('The member')
            .setRequired(true)
            .setAutocomplete(true))
            .addBooleanOption((option) => option
            .setName('discord')
            .setDescription('Send automatic reminders via Discord')
            .setRequired(true))
            .addBooleanOption((option) => option
            .setName('reddit')
            .setDescription('Send automatic reminders via Reddit')
            .setRequired(true)))
            .addSubcommand((command) => command
            .setName('import')
            .setDescription('Import MPs from list (provided on whip sheet), /help import-formula')
            .addStringOption((option) => option
            .setName('input')
            .setDescription('The comma delimited input')
            .setRequired(true)))
            .addSubcommand((command) => command
            .setName('phase-out')
            .setDescription('Set a division the member will be phased out from.')
            .addStringOption((option) => option
            .setName('member')
            .setDescription('The member')
            .setRequired(true)
            .setAutocomplete(true))
            .addStringOption((option) => option
            .setName('datetime')
            .setDescription('YYYY-MM-DD HH:mm e.g. 2023-07-09 10:00')
            .setAutocomplete(false)
            .setRequired(true))), { idHints: ['1116156532959232090'] });
    }
    chatInputList(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const members = yield this.memberRepository.find();
            if (members.length == 0) {
                interaction.editReply('No members found.');
                return;
            }
            const responseEmbed = new discord_js_1.EmbedBuilder()
                .setTitle('Current members list');
            for (const member of members) {
                responseEmbed.addFields({
                    name: member.redditUsername,
                    value: (member.discordSnowflake ? `<@${member.discordSnowflake}>` : 'No Discord account') + ' - ' + this.formatReminderChannelsString(member),
                });
            }
            yield interaction.editReply({ embeds: [responseEmbed] });
        });
    }
    chatInputAdd(interaction) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const redditUsername = interaction.options.getString('reddit-username');
            const discordSnowflake = (_b = (_a = interaction.options.get('discord-user')) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : null;
            if (!redditUsername) {
                yield interaction.editReply({ content: 'Please provide a username.' });
                return;
            }
            else if (redditUsername.startsWith('u/') || redditUsername.startsWith('/u/')) {
                yield interaction.editReply({ content: 'Please provide a username without the /u/ prefix.' });
                return;
            }
            const member = new Member_1.Member();
            member.redditUsername = redditUsername;
            member.discordSnowflake = (_c = discordSnowflake === null || discordSnowflake === void 0 ? void 0 : discordSnowflake.toString()) !== null && _c !== void 0 ? _c : '';
            yield this.memberRepository.save(member);
            yield interaction.editReply({ content: `Added member ${member.redditUsername}!` });
        });
    }
    chatInputRemove(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const redditUsername = interaction.options.getString('member');
            if (!redditUsername) {
                yield interaction.editReply({ content: 'Please provide a username.' });
                return;
            }
            const member = yield this.memberRepository.findOneBy({ redditUsername: redditUsername });
            if (!member) {
                yield interaction.editReply({ content: 'Please provide a valid username.' });
                return;
            }
            yield this.memberRepository.remove(member);
            yield interaction.editReply('Member removed.');
        });
    }
    chatInputReminderChannels(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const redditUsername = interaction.options.getString('member');
            if (!redditUsername) {
                yield interaction.editReply({ content: 'Please provide a username.' });
                return;
            }
            const sendRedditReminders = (_a = interaction.options.getBoolean('reddit')) !== null && _a !== void 0 ? _a : false;
            const sendDiscordReminders = (_b = interaction.options.getBoolean('discord')) !== null && _b !== void 0 ? _b : false;
            const member = yield this.memberRepository.findOneBy({ redditUsername: redditUsername });
            if (!member) {
                yield interaction.editReply({ content: 'Please provide a valid username.' });
                return;
            }
            if (sendDiscordReminders && !member.discordSnowflake) {
                yield interaction.editReply('Error: Please edit the member to add a Discord account before enabling Discord reminders.');
                return;
            }
            member.sendDiscordReminders = sendDiscordReminders;
            member.sendRedditReminders = sendRedditReminders;
            yield this.memberRepository.save(member);
            yield interaction.editReply({ content: `Edited reminder channels for member ${member.redditUsername}!` });
        });
    }
    chatInputImport(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const input = interaction.options.getString('input');
            if (!input) {
                yield interaction.reply({ content: 'Please provide valid input.' });
                return;
            }
            yield interaction.deferReply();
            const memberUsernames = (yield this.memberRepository.find()).map(member => member.redditUsername);
            var arr = input.split(/[ ,]+/);
            arr = arr.filter(entry => entry.trim() != '');
            const usernames = arr.filter(entry => !memberUsernames.includes(entry));
            for (const i in usernames) {
                const member = new Member_1.Member();
                member.redditUsername = usernames[i];
                member.sendDiscordReminders = false;
                yield this.memberRepository.save(member);
            }
            yield interaction.editReply({ content: `Added ${arr.length} members excluding duplicates.` });
        });
    }
    chatInputPhaseOut(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const datetime = interaction.options.getString('datetime');
            const formattedDateTime = (0, dayjs_1.default)(datetime);
            if (!formattedDateTime.isValid()) {
                yield interaction.editReply({ content: 'Datetime invalid. See command option description for the correct format.' });
                return;
            }
            const redditUsername = interaction.options.getString('member');
            if (!redditUsername) {
                yield interaction.editReply({ content: 'Please provide a username.' });
                return;
            }
            const member = yield this.memberRepository.findOneBy({ redditUsername: redditUsername });
            if (!member) {
                yield interaction.editReply({ content: 'Please provide a valid username.' });
                return;
            }
            member.phaseOutFrom = formattedDateTime.toDate();
            this.memberRepository.save(member);
            yield interaction.editReply({ content: `${member.redditUsername} phased out from ${formattedDateTime.toString()}.` });
        });
    }
    formatReminderChannelsString(member) {
        if (member.sendDiscordReminders && member.sendRedditReminders) {
            return "Auto Discord+Reddit reminders";
        }
        else if (member.sendDiscordReminders) {
            return "Auto Discord reminders";
        }
        else if (member.sendRedditReminders) {
            return "Auto Reddit reminders";
        }
        else {
            return "No auto reminders";
        }
    }
}
exports.MembersCommand = MembersCommand;
