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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhipCommand = void 0;
const plugin_subcommands_1 = require("@sapphire/plugin-subcommands");
const data_source_1 = require("../data-source");
const Division_1 = require("../entity/Division");
const whipConfig_json_1 = require("../whipConfig.json");
const discord_js_1 = require("discord.js");
const Subreddit_1 = require("../reddit/Subreddit");
const Formatters_1 = require("../utilities/Formatters");
const typeorm_1 = require("typeorm");
class WhipCommand extends plugin_subcommands_1.Subcommand {
    constructor(context, options) {
        super(context, Object.assign(Object.assign({}, options), { name: 'whip', description: 'Whip commands', subcommands: [
                { name: 'issue', chatInputRun: 'chatInputIssue' },
                { name: 'check', chatInputRun: 'chatInputCheck' },
                { name: 'check-active', chatInputRun: 'chatInputCheckActive' },
            ] }));
        this.divisionsRepository = data_source_1.AppDataSource.getRepository(Division_1.Division);
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder => builder
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand(command => command
            .setName('issue')
            .setDescription('Issue initial whip notice')
            .addStringOption(option => option.setName('division_1').setRequired(true).setDescription('First division ID').setAutocomplete(true))
            .addStringOption(option => option.setName('division_2').setRequired(false).setDescription('Second division ID').setAutocomplete(true))
            .addStringOption(option => option.setName('division_3').setRequired(false).setDescription('Third division ID').setAutocomplete(true))
            .addStringOption(option => option.setName('division_4').setRequired(false).setDescription('Fourth division ID').setAutocomplete(true))
            .addStringOption(option => option.setName('notes').setDescription('Notes displayed alongside').setRequired(false)))
            .addSubcommand(command => command
            .setName('check')
            .setDescription('Check the status of a division')
            .addStringOption(option => option.setName('division_id').setDescription('Division ID').setAutocomplete(true).setRequired(true)))
            .addSubcommand(command => command
            .setName('check-active')
            .setDescription('Check the status of all active divisions')), { idHints: ['1116387569484181524'] });
    }
    createCheckEmbed(division, thread) {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`Status of ${division.shortName}`)
                .setDescription(`${division.directive} - ends ${(0, Formatters_1.formatDate)(division.closesAt)}`)
                .setURL(division.url)
                .setFooter({ text: division.longName });
            console.log('Ayes' + thread.getAyes());
            let ayeField = '';
            let noField = '';
            let abstainField = '';
            let noVoteField = '';
            thread.getAyes().forEach(username => {
                ayeField += `${username} \n`;
            });
            thread.getNoes().forEach(username => {
                noField += `${username} \n`;
            });
            thread.getAbstentions().forEach(username => {
                abstainField += `${username} \n`;
            });
            const notVoted = yield thread.getMembersNotVoted();
            notVoted.forEach(username => {
                noVoteField += `${username} \n`;
            });
            embed.addFields({ name: 'Aye votes', value: ayeField != '' ? ayeField : 'None recorded.' }, { name: 'No votes', value: noField != '' ? noField : 'None recorded.' }, { name: 'Abstain votes', value: abstainField != '' ? abstainField : 'None recorded.' }, { name: 'No vote recorded', value: noVoteField != '' ? noVoteField : 'None recorded.' });
            return embed;
        });
    }
    chatInputIssue(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.deferReply();
            const division1Id = interaction.options.getString('division_1');
            if (!division1Id) {
                yield interaction.editReply({ content: 'Invalid first division ID' });
                return;
            }
            var ids = [division1Id.toUpperCase()];
            for (let i = 2; i <= 4; i++) {
                let id = interaction.options.getString(`division_${i}`);
                if (id) {
                    ids.push(id.toUpperCase());
                }
            }
            const embeds = [];
            for (let id of ids) {
                const division = yield this.divisionsRepository.findOneBy({ shortName: id });
                if (!division) {
                    yield interaction.editReply({ content: `Please provide a valid division ID for division ${id}.` });
                    return;
                }
                embeds.push(division.whipEmbed);
            }
            const notes = interaction.options.getString('notes');
            if (notes) {
                embeds.push(new discord_js_1.EmbedBuilder()
                    .setTitle('Explanatory notes')
                    .setDescription(notes));
            }
            const channel = this.container.client.channels.cache.get(whipConfig_json_1.whipIssueChannelId);
            if (!channel || channel.type != (discord_js_1.ChannelType.GuildText)) {
                yield interaction.editReply({ content: 'Error: Invalid channel ID specified in whipConfig.json.' });
                return;
            }
            channel.send({
                content: `<@&${whipConfig_json_1.memberRoleId}>`,
                embeds: embeds
            });
            yield interaction.editReply({ content: `Whips issued in <#${channel.id}>` });
        });
    }
    chatInputCheck(interaction) {
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
            const thread = yield (0, Subreddit_1.fetchThread)(division.url);
            if (!thread) {
                yield interaction.reply({ content: 'Error. Re-add the division.' });
                return;
            }
            const responseEmbed = yield this.createCheckEmbed(division, thread);
            const pasteableButton = new discord_js_1.ButtonBuilder()
                .setCustomId('whip-result-pasteable')
                .setLabel('Pasteable results')
                .setStyle(discord_js_1.ButtonStyle.Secondary);
            const actionRow = new discord_js_1.ActionRowBuilder().addComponents(pasteableButton);
            yield interaction.editReply({ embeds: [responseEmbed], components: [actionRow] });
        });
    }
    chatInputCheckActive(interaction) {
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
            const embeds = [];
            for (const division of divisions) {
                const thread = yield (0, Subreddit_1.fetchThread)(division.url);
                if (!thread) {
                    yield interaction.reply({ content: `Error. Re-add the division ${division.shortName}.` });
                    return;
                }
                const responseEmbed = yield this.createCheckEmbed(division, thread);
                embeds.push(responseEmbed);
            }
            yield interaction.editReply({ embeds: embeds });
        });
    }
}
exports.WhipCommand = WhipCommand;
