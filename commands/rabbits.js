const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('rabbits')
      .setDescription('Learn more about rabbits'),
    async execute(interaction) {
      await interaction.reply(
          'THIS BOT IS CONTROLLED BY THE LEAGUE OF RABBITS HONK OHK NOHK',
      );
    },
};