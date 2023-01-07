const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Division } = require('../dbObjects');
const { findDivisionByUrl } = require('../functions/reddit');
const moment = require('moment-timezone');
const momentFormat = 'dddd, MMMM Do YYYY, h:mm:ss a';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('divisions')
        .setDescription('Manage divisions')
        .addSubcommand(subcommand =>
            subcommand
                .setName('current')
                .setDescription('View current divisions'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add division')
                .addStringOption(option =>
                    option.setName('reddit_url').setRequired(true).setDescription('Full Reddit URL of the division'),
                )
                .addStringOption(option =>
                    option.setName('whip').setRequired(true).setDescription('Aye, No, Abs').setChoices(
                        { name: 'Aye', value: 'aye' },
                        { name: 'No', value: 'no' },
                        { name: 'Abstain', value: 'abs' },
                    ),
                )
                .addIntegerOption(option =>
                    option.setName('line').setRequired(true).setDescription('None, 1, 2, 3').setChoices(
                        { name: 'None', value: 0 },
                        { name: '1 Line', value: 1 },
                        { name: '2 Line', value: 2 },
                        { name: '3 Line', value: 3 },
                    ),
                )
                .addIntegerOption(option =>
                    option.setName('days_ends_in').setDescription('Defaults to 3. Bot will assume ending 10pm UK time.'),
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove division')
                .addStringOption(option =>
                    option.setName('division_id').setRequired(true).setDescription('Division ID (Bxxx)').setAutocomplete(true),
                )),
    // async autocomplete(interaction) {
    //     console.log('Autocompleting');
    //     const choices = [];
    //     const currentDivisions = await Division.findAll();
    //     if (currentDivisions !== null) {
    //         currentDivisions.forEach(division => {
    //             choices.push(division.id);
    //         });
    //     }
    //     console.log(currentDivisions);
    //     await interaction.respond(
    //         choices.map(choice => ({ name: choice, value: choice })),
    //     );
    // },
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'current': {
                await interaction.deferReply();
                const currentDivisions = await Division.findAll();
                if (currentDivisions.length === null) {
                    await interaction.editReply('No current divisions');
                    return;
                }
                const responseEmbed = new EmbedBuilder()
                    .setTitle('Current divisions')
                    .setDescription('Manage these with the `add` and `remove` subcommands.');
                currentDivisions.forEach(division => {
                    responseEmbed.addFields({
                        name: `${division.id} - ${division.url} - **${division.lineText} line ${division.whip.toString().toUpperCase()}**`,
                        value: `Ends ${division.end_date.format(momentFormat)}`,
                    });
                });
                await interaction.editReply({ embeds: [responseEmbed] });
                break;
            }
            case 'add': {
                await interaction.deferReply();
                const redditUrl = interaction.options.getString('reddit_url');
                const whip = interaction.options.getString('whip');
                const line = interaction.options.getInteger('line');
                let daysEndsIn = interaction.options.getInteger('days_ends_in');
                if (daysEndsIn < 1) {
                    daysEndsIn = null;
                }
                if (!redditUrl || !whip || !line) {
                    await interaction.editReply({ content: 'Please provide a reddit URL and whip setting.', ephemeral: true });
                    return;
                }
                else if (await Division.findOne({ where: { url: redditUrl } }) instanceof Division) {
                    await interaction.editReply({ content: `Division ${redditUrl} already on list.`, ephemeral: true });
                    return;
                }
                else {
                    const division = await findDivisionByUrl(redditUrl);
                    if (division === null) {
                        await interaction.editReply('Operation failed.');
                        return;
                    }
                    const dbDivision = Division.create({
                        id: division.id,
                        url: division.url,
                        whip: whip,
                        line: line,
                        end_date: moment().add(daysEndsIn ?? 3, 'days').hour(22).minute(0).second(0),
                    });
                    if (dbDivision === null) {
                        await interaction.editReply('Operation failed.');
                        return;
                    }
                    await interaction.editReply(`Division ${division.id} added!`);
                }
                break;
            }
            case 'remove': {
                await interaction.deferReply();
                const divisionId = interaction.options.getString('division_id');
                if ((!divisionId) || (await Division.findByPk(divisionId) === null)) {
                    await interaction.editReply({ content: 'Please provide a valid current division ID. Use `/divisions current` to view current divisions.', ephemeral: true });
                    return;
                }
                const division = await Division.findByPk(divisionId);
                await division.destroy();
                await interaction.editReply(`${divisionId} removed.`);
                break;
            }
            default: {
                interaction.reply('Subcommand required.');
                return;
            }
        }
    },
};