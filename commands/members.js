const { SlashCommandBuilder } = require('discord.js');
const { Mps } = require('../dbObjects');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mps')
        .setDescription('Manage Members of Parliament')
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('View all MPs'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add an MP')
                .addStringOption(option => option.setName('username').setDescription('Reddit username with no prefix').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('remove an MP')
                .addStringOption(option => option.setName('username').setDescription('Reddit username with no prefix').setRequired(true))),
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'all': {
                const activeMps = await Mps.findAll();
                await interaction.reply('All users:', JSON.stringify(activeMps, null, 2));
                break;
            }
            case 'add': {
                await interaction.reply('add');
                break;
            }
        }
    },
};