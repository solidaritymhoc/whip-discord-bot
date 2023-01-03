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
                .addStringOption(option => option.setName('reddit_url').setRequired(true).setDescription('Full Reddit URL of the division'))
                .addStringOption(option => option.setName('whip').setRequired(true).setDescription('Aye, No, Abs').setChoices(
                    { name: 'Aye', value: 'aye' },
                    { name: 'No', value: 'no' },
                    { name: 'Abstain', value: 'abs' },
                ))
                .addIntegerOption(option => option.setName('days_ends_in').setDescription('Defaults to 3. Bot will assume ending 10pm UK time.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove division')
                .addStringOption(option => option.setName('division_id').setRequired(true).setDescription('Division ID (Bxxx)').setAutocomplete(true))),
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
                        name: `[${division.id.toString()}](${division.url.toString()}) - Whip **${division.whip.toString().toUpperCase()}**`,
                        value: `Ends ${moment(division.end_date).format(momentFormat)}`,
                    });
                });
                await interaction.editReply({ embeds: [responseEmbed] });
                break;
            }
            case 'add': {
                await interaction.deferReply();
                const redditUrl = interaction.options.getString('reddit_url');
                const whip = interaction.options.getString('whip');
                let daysEndsIn = interaction.options.getInteger('days_ends_in');
                if (daysEndsIn < 1) {
                    daysEndsIn = null;
                }
                if (!redditUrl || !whip) {
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
                        end_date: moment().add(daysEndsIn ?? 3, 'days').hour(22).minute(0).second(0).toDate(),
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
                break;
            }
            default: {
                interaction.reply('Subcommand required.');
                return;
            }
        }
    },
};