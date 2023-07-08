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
exports.DivisionsCommand = void 0;
const plugin_subcommands_1 = require("@sapphire/plugin-subcommands");
const data_source_1 = require("../data-source");
const Division_1 = require("../entity/Division");
const discord_js_1 = require("discord.js");
const Formatters_1 = require("../utilities/Formatters");
const typeorm_1 = require("typeorm");
const Subreddit_1 = require("../reddit/Subreddit");
const moment_1 = __importDefault(require("moment"));
class DivisionsCommand extends plugin_subcommands_1.Subcommand {
    constructor(context, options) {
        super(context, Object.assign(Object.assign({}, options), { name: 'divisions', description: 'Divisions management', subcommands: [
                {
                    name: 'list',
                    chatInputRun: 'chatInputList',
                },
                {
                    name: 'active',
                    chatInputRun: 'chatInputActive',
                },
                {
                    name: 'add',
                    chatInputRun: 'chatInputAdd',
                },
                {
                    name: 'remove',
                    chatInputRun: 'chatInputRemove',
                },
            ] }));
        this.divisionsRepository = data_source_1.AppDataSource.getRepository(Division_1.Division);
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((command) => command.setName('list').setDescription('List all divisions'))
            .addSubcommand((command) => command.setName('active').setDescription('List all active divisions'))
            .addSubcommand((command) => command
            .setName('add')
            .setDescription('Add a new division')
            .addStringOption((option) => option
            .setName('url')
            .setDescription('The URL of the division')
            .setRequired(true))
            .addStringOption(option => option.setName('whip').setRequired(true).setDescription('Aye, No, Abs, Free').setChoices({ name: 'Aye', value: 'aye' }, { name: 'No', value: 'no' }, { name: 'Abstain', value: 'abs' }, { name: 'Free', value: 'free' }))
            .addIntegerOption(option => option.setName('line').setRequired(true).setDescription('None, 1, 2, 3').setChoices({ name: 'None', value: 4 }, { name: '1 Line', value: 1 }, { name: '2 Line', value: 2 }, { name: '3 Line', value: 3 }))
            .addIntegerOption(option => option.setName('days_ends_in').setDescription('Defaults to 3. Bot will assume ending 10pm UK time.')))
            .addSubcommand((command) => command
            .setName('remove')
            .setDescription('Remove a division')
            .addStringOption((option) => option
            .setName('division_id')
            .setDescription('The division ID')
            .setRequired(true)
            .setAutocomplete(true))), { idHints: ['1116156534100078593'] });
    }
    chatInputList(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const divisions = yield this.divisionsRepository.find({
                order: {
                    closesAt: 'ASC'
                }
            });
            if (divisions.length == 0) {
                interaction.editReply('No divisions found.');
                return;
            }
            const responseEmbed = new discord_js_1.EmbedBuilder()
                .setTitle('All divisions')
                .setDescription('Manage these with the `divisions add` and `divisions remove` subcommands.');
            for (const division of divisions) {
                // let remindersSentString = 'No reminders sent.';
                // if (division.first_reminder_sent && division.second_reminder_sent) {
                //     remindersSentString = '2 reminders sent.';
                // }
                // else if (division.first_reminder_sent) {
                //     remindersSentString = '1 reminder sent.';
                // }
                const endsString = division.closed ? '**Closed on** ' : 'Ends at';
                responseEmbed.addFields({
                    name: `${division.shortName} ${division.longName} - ${division.url} - **${division.directive}**`,
                    value: `${endsString} ${(0, Formatters_1.formatDate)(division.closesAt)}.`,
                });
            }
            yield interaction.editReply({ embeds: [responseEmbed] });
        });
    }
    chatInputActive(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const divisions = yield this.divisionsRepository.find({
                where: {
                    closesAt: (0, typeorm_1.MoreThan)(new Date()),
                },
                order: {
                    closesAt: 'ASC'
                }
            });
            if (divisions.length == 0) {
                interaction.editReply('No divisions found.');
                return;
            }
            const responseEmbed = new discord_js_1.EmbedBuilder()
                .setTitle('Active divisions')
                .setDescription('Manage these with the `divisions add` and `divisions remove` subcommands.');
            for (const division of divisions) {
                // let remindersSentString = 'No reminders sent.';
                // if (division.first_reminder_sent && division.second_reminder_sent) {
                //     remindersSentString = '2 reminders sent.';
                // }
                // else if (division.first_reminder_sent) {
                //     remindersSentString = '1 reminder sent.';
                // }
                responseEmbed.addFields({
                    name: `${division.shortName} ${division.longName} - ${division.url} - **${division.directive}**`,
                    value: `Ends ${(0, Formatters_1.formatDate)(division.closesAt)}.`,
                });
            }
            yield interaction.editReply({ embeds: [responseEmbed] });
        });
    }
    chatInputAdd(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlOption = interaction.options.getString('url');
            const whipVoteOption = interaction.options.getString('whip');
            const whipLineOption = interaction.options.getInteger('line');
            var daysEndsInOption = interaction.options.getInteger('days_ends_in');
            if (daysEndsInOption && daysEndsInOption < 1) {
                daysEndsInOption = null;
            }
            // Validation
            if (!urlOption || !whipLineOption || !whipVoteOption) {
                yield interaction.reply({ content: 'Please provide a reddit URL and whip setting.' });
                return;
            }
            else if (yield this.divisionsRepository.findOneBy({ url: urlOption })) {
                yield interaction.reply({ content: `Division with URL ${urlOption} already on list.` });
                return;
            }
            const thread = yield (0, Subreddit_1.fetchThread)(urlOption);
            if (!thread) {
                yield interaction.reply({ content: 'Error. Check you have entered a valid URL.' });
                return;
            }
            const division = new Division_1.Division();
            division.shortName = thread.shortName;
            division.longName = thread.longName;
            division.url = thread.url;
            division.closesAt = (0, moment_1.default)().add(daysEndsInOption !== null && daysEndsInOption !== void 0 ? daysEndsInOption : 3, 'days').hour(22).minute(0).second(0).toDate();
            if (whipVoteOption == 'free') {
                division.freeVote = true;
            }
            else {
                division.whipVote = whipVoteOption;
                division.whipLine = whipLineOption;
            }
            yield this.divisionsRepository.save(division);
            yield interaction.reply({ content: `Added new division ${division.shortName} ${division.longName}!` });
        });
    }
    chatInputRemove(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const divisionId = interaction.options.getString('division_id');
            if (!divisionId) {
                yield interaction.editReply({ content: 'Please provide a division ID.' });
                return;
            }
            const division = yield this.divisionsRepository.findOneBy({ shortName: divisionId });
            if (!division) {
                yield interaction.editReply({ content: 'Please provide a valid division ID.' });
                return;
            }
            yield this.divisionsRepository.remove(division);
            yield interaction.editReply('Division removed.');
        });
    }
}
exports.DivisionsCommand = DivisionsCommand;
