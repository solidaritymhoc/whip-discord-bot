const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { Division } = require('../dbObjects');
const { findDivisionByUrl } = require('../functions/reddit');
const moment = require('moment-timezone');
const momentFormat = 'dddd, MMMM Do YYYY, h:mm:ss a';
const config = require('config');
const app = require('../app.js');

/**
 * Commands for managing individual divisions.
 */

module.exports = {
    data: new SlashCommandBuilder()
        .setName('divisions')
        .setDescription('Manage divisions')
        .addSubcommand(subcommand =>
            // View all current divisions
            subcommand
                .setName('current')
                .setDescription('View current divisions'))
        .addSubcommand(subcommand =>
            // Add a new division
            subcommand
                .setName('add')
                .setDescription('Add division')
                .addStringOption(option =>
                    // https://reddit.com/r/mhocmp/xxxx/xxx...
                    option.setName('reddit_url').setRequired(true).setDescription('Full Reddit URL of the division'),
                )
                .addStringOption(option =>
                    option.setName('whip').setRequired(true).setDescription('Aye, No, Abs').setChoices(
                        { name: 'Aye', value: 'aye' },
                        { name: 'No', value: 'no' },
                        { name: 'Abstain', value: 'abs' },
                        { name: 'Free', value: 'free' },
                    ),
                )
                .addIntegerOption(option =>
                    option.setName('line').setRequired(true).setDescription('None, 1, 2, 3').setChoices(
                        { name: 'None', value: 4 },
                        { name: '1 Line', value: 1 },
                        { name: '2 Line', value: 2 },
                        { name: '3 Line', value: 3 },
                    ),
                )
                .addIntegerOption(option =>
                    option.setName('days_ends_in').setDescription('Defaults to 3. Bot will assume ending 10pm UK time.'),
                ))
        .addSubcommand(subcommand =>
            // Remove a division
            subcommand
                .setName('remove')
                .setDescription('Remove division')
                .addStringOption(option =>
                    // B1xxx
                    option.setName('division_id').setRequired(true).setDescription('Division ID (Bxxx)').setAutocomplete(true),
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('notify')
                .setDescription('Notify MPs of up to 4 divisions.')
                .addStringOption(option =>
                    // B1xxx
                    option.setName('division_1').setRequired(true).setDescription('First division ID').setAutocomplete(true),
                )
                .addStringOption(option =>
                    // B1xxx
                    option.setName('division_2').setRequired(false).setDescription('Second division ID').setAutocomplete(true),
                )
                .addStringOption(option =>
                    // B1xxx
                    option.setName('division_3').setRequired(false).setDescription('Third division ID').setAutocomplete(true),
                )
                .addStringOption(option =>
                    // B1xxx
                    option.setName('division_4').setRequired(false).setDescription('Fourth division ID').setAutocomplete(true),
                ),
        ),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);

        const choices = [];

        if (focusedOption.name.startsWith('division_')) {
            const currentDivisions = await Division.findAll();
            if (currentDivisions !== null) {
                currentDivisions.forEach(division => {
                    choices.push(division.id);
                });
            }
        }

        await interaction.respond(
            choices.map(choice => ({ name: choice, value: choice })),
        );
    },
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
                    let remindersSentString = 'No reminders sent.';
                    if (division.first_reminder_sent && division.second_reminder_sent) {
                        remindersSentString = '2 reminders sent.';
                    }
                    else if (division.first_reminder_sent) {
                        remindersSentString = '1 reminder sent.';
                    }
                    responseEmbed.addFields({
                        name: `${division.id} - ${division.url} - **${division.lineText} line ${division.whip.toString().toUpperCase()}**`,
                        value: `Ends ${division.end_date.format(momentFormat)}. ${remindersSentString}`,
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
            case 'notify': {
                await interaction.deferReply();

                let divisionIds = [
                    interaction.options.getString('division_1').toUpperCase(),
                ];
                for (let i = 2; i <= 4; i++) {
                    const id = interaction.options.getString(`division_${i}`);
                    if (id) {
                        divisionIds.push(id.toUpperCase());
                    }
                }

                const embeds = [];

                for (const id of divisionIds) {
                    const division = await Division.findByPk(id);
                    if (!(division instanceof Division)) {
                        continue;
                    }

                    let colour = null;
                    switch (division.whip) {
                        case 'aye': {
                            colour = Colors.Green;
                            break;
                        }
                        case 'no': {
                            colour = Colors.Red;
                            break;
                        }
                        case 'abs': {
                            colour = Colors.Yellow;
                            break;
                        }
                        case 'free': {
                            colour = Colors.Greyple;
                            break;
                        }
                    }

                    const embed = new EmbedBuilder()
                        .setTitle(`${division.id} - **${division.lineText} line ${division.whip.toString().toUpperCase()}**`)
                        .setDescription(`Division ends ${division.end_date.format(momentFormat)}`)
                        .setURL(division.url)
                        .setColor(colour);

                    embeds.push(embed);
                }

                const whipChannel = app.discordClient.channels.cache.get(config.get('guild.whipChannelId'));

                whipChannel.send({ content: `<@&${config.get('guild.mpsRoleId')}>`, embeds: embeds });

                await interaction.editReply(`Sent notifications to ${whipChannel.toString()}.`);

                break;
            }
            default: {
                await interaction.reply('Subcommand required.');
                return;
            }
        }
    },
};