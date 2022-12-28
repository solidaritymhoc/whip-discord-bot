const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Rabbits'),
    async execute(interaction) {
        await interaction.reply('Rabbits');
    },
};