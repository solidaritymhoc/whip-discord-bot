const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getDivisionVotes } = require('../functions/reddit');
const { getMpsAgainstWhip, getMpsComplyWhip, getMpsDnv } = require('../functions/whip');
const escape = require('markdown-escape');
const { Division } = require('../dbObjects');
const { getRedditId } = require('../functions/utils');

const Commands = {
    Division: 'division',
    All: 'all',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check')
        .setDescription('Check the voting record of an open division.')
        .addSubcommand(subcommand =>
            subcommand
                .setName(Commands.Division)
                .setDescription('Checks commons division')
                .addStringOption(option =>
                    option.setName('division_id').setRequired(true).setDescription('Division ID (Bxxx)').setAutocomplete(true),
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName(Commands.All)
                .setDescription('Checks all open divisions'),
        ),
    async autocomplete(interaction) {
      const focusedOption = interaction.options.getFocused(true);
      const choices = [];
      if (focusedOption.name === 'division_id') {
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
            case Commands.Division: {
                await interaction.deferReply();

                const division = await Division.findByPk(interaction.options.getString('division_id'));
                if (!(division instanceof Division)) {
                    await interaction.editReply({ content: 'Please provide a valid current division ID. Use `/divisions current` to view current divisions.', ephemeral: true });
                    return;
                }

                const votes = await getDivisionVotes(getRedditId(division.url));

                const mpsAgainstWhip = getMpsAgainstWhip(votes, division.whip);
                const mpsComplyWhip = getMpsComplyWhip(votes, division.whip);
                const mpsDnv = await getMpsDnv(votes);

                let fieldComplyValue = '';
                mpsComplyWhip.forEach(mp => fieldComplyValue += `${escape(mp[0])} \n`);
                if (fieldComplyValue === '') fieldComplyValue = 'None';

                let fieldAgainstValue = '';
                mpsAgainstWhip.forEach(mp => fieldAgainstValue += `${escape(mp[0])} (${mp[1]}) \n`);
                if (fieldAgainstValue === '') fieldAgainstValue = 'None';

                let fieldDnvValue = '';
                mpsDnv.forEach(mp => fieldDnvValue += `${escape(mp)} \n`);
                if (fieldDnvValue === '') fieldDnvValue = 'None';

                const responseEmbed = new EmbedBuilder()
                    .setTitle(`Status of division ${division.id} (${division.url})`)
                    .setDescription(`Requested whip is ${division.lineText} line ${division.whip.toUpperCase()}. ${votes.comments.length.toString()} votes so far.`)
                    .addFields(
                        { name: 'Complying:', value: fieldComplyValue },
                        { name: 'Against:', value: fieldAgainstValue },
                        { name: 'DNV', value: fieldDnvValue },
                    );

                await interaction.editReply({ embeds: [responseEmbed] });

                break;
            }
            case Commands.All: {
                await interaction.deferReply();

                const currentDivisions = await Division.findAll();
                if (currentDivisions.length === null) {
                    await interaction.editReply('No current divisions');
                    return;
                }

                const embeds = [];

                for (const division of currentDivisions) {
                    const votes = await getDivisionVotes(getRedditId(division.url));

                    const mpsAgainstWhip = getMpsAgainstWhip(votes, division.whip);
                    const mpsComplyWhip = getMpsComplyWhip(votes, division.whip);
                    const mpsDnv = await getMpsDnv(votes);

                    let fieldComplyValue = '';
                    mpsComplyWhip.forEach(mp => fieldComplyValue += `${escape(mp[0])} \n`);
                    if (fieldComplyValue === '') fieldComplyValue = 'None';

                    let fieldAgainstValue = '';
                    mpsAgainstWhip.forEach(mp => fieldAgainstValue += `${escape(mp[0])} (${mp[1]}) \n`);
                    if (fieldAgainstValue === '') fieldAgainstValue = 'None';

                    let fieldDnvValue = '';
                    mpsDnv.forEach(mp => fieldDnvValue += `${escape(mp)} \n`);
                    if (fieldDnvValue === '') fieldDnvValue = 'None';

                    const responseEmbed = new EmbedBuilder()
                        .setTitle(`Status of division ${division.id} (${division.url})`)
                        .setDescription(`Requested whip is ${division.lineText} line ${division.whip.toUpperCase()}. ${votes.comments.length.toString()} votes so far.`)
                        .addFields(
                            { name: 'Complying:', value: fieldComplyValue },
                            { name: 'Against:', value: fieldAgainstValue },
                            { name: 'DNV', value: fieldDnvValue },
                        );
                    embeds.push(responseEmbed);
                }


                await interaction.editReply({ embeds: embeds });

                break;
            }
            default: {
                await interaction.reply('Subcommand required.');
                return;
            }
        }
        await interaction.deferReply();
        const redditId = interaction.options.get('reddit_id').value;
        const whip = interaction.options.get('whip').value;

        const division = await getDivisionVotes(redditId);
        if (!(division instanceof Division)) {
            await interaction.editReply('Operation failed. Check the vote ID is correct.');
            return;
        }

        const mpsAgainstWhip = getMpsAgainstWhip(division, whip);
        const mpsComplyWhip = getMpsComplyWhip(division, whip);
        const mpsDnv = await getMpsDnv(division);

        let fieldComplyValue = '';
        mpsComplyWhip.forEach(mp => fieldComplyValue += `${escape(mp[0])} \n`);
        if (fieldComplyValue === '') fieldComplyValue = 'None';

        let fieldAgainstValue = '';
        mpsAgainstWhip.forEach(mp => fieldAgainstValue += `${escape(mp[0])} (${mp[1]}) \n`);
        if (fieldAgainstValue === '') fieldAgainstValue = 'None';

        let fieldDnvValue = '';
        mpsDnv.forEach(mp => fieldDnvValue += `${escape(mp)} \n`);
        if (fieldDnvValue === '') fieldDnvValue = 'None';

        const responseEmbed = new EmbedBuilder()
            .setTitle(`Status of division ${division.id} (${division.url})`)
            .setDescription(`Requested whip is **${whip.toUpperCase()}**. ${division.comments.length.toString()} votes so far.`)
            .addFields(
                { name: 'Complying:', value: fieldComplyValue },
                { name: 'Against:', value: fieldAgainstValue },
                { name: 'DNV', value: fieldDnvValue },
            );

        await interaction.editReply({ embeds: [responseEmbed] });
    },
};