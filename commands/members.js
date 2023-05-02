const { SlashCommandBuilder } = require('discord.js');
const { Mps } = require('../dbObjects');

const Commands = {
    All: 'all',
    Add: 'add',
    Remove: 'remove',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mps')
        .setDescription('Manage Members of Parliament')
        .addSubcommand(subcommand =>
            subcommand
                .setName(Commands.All)
                .setDescription('View all MPs'))
        .addSubcommand(subcommand =>
            subcommand
                .setName(Commands.Add)
                .setDescription('Add an MP')
                .addStringOption(option => option.setName('username').setDescription('Reddit username with no prefix').setRequired(true))
                .addUserOption(option => option.setName('discord_user').setDescription('Discord account if available').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName(Commands.Remove)
                .setDescription('remove an MP')
                .addStringOption(option => option.setName('username').setDescription('Reddit username with no prefix').setRequired(true))),
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case Commands.All: {
                await interaction.deferReply();
                const activeMps = await Mps.findAll();
                let responseString = '';
                activeMps.forEach(mp => responseString += (mp.name + ' (<@' + mp.discord_id + '>)' + '\n'));
                if (responseString.length === 0) responseString = 'None found.';
                await interaction.editReply('**Current MPs:**\n\n' + responseString + '\n\nUse the `mp add` and `mp remove` commands to manage this list.');
                break;
            }
            case Commands.Add: {
                await interaction.deferReply({ ephemeral: true });

                const username = interaction.options.getString('username');
                const discord_user_id = interaction.options.get('discord_user')?.value ?? null;
                const paranoid = await Mps.findByPk(username, { paranoid: false });

                if (!username) {
                    await interaction.editReply({ content: 'Please provide a username.', ephemeral: true });
                    return;
                }
                else if (paranoid instanceof Mps) {
                    if (paranoid.isSoftDeleted()) {
                        await paranoid.restore();
                        await interaction.editReply({ content: `MP ${username} restored.`, ephemeral: true });
                        return;
                    }
                    await interaction.editReply({ content: `MP ${username} already on list.`, ephemeral: true });
                    return;
                }
                else {
                    const newMp = await Mps.create({ name: username, discord_id: discord_user_id });
                    if (newMp === null) {
                        await interaction.editReply('Insert failed.');
                        return;
                    }
                    await interaction.editReply(`${username} added!`);
                }
                break;
            }
            case Commands.Remove: {
                await interaction.deferReply({ ephemeral: true });
                const username = interaction.options.getString('username');
                if (!username) {
                    await interaction.editReply({ content: 'Please provide a username.', ephemeral: true });
                    return;
                }
                else if (await Mps.findByPk(username) === null) {
                    await interaction.editReply({ content: `MP ${username} not on list.`, ephemeral: true });
                    return;
                }
                else {
                    const mp = await Mps.findByPk(username);
                    await mp.destroy();
                    await interaction.editReply(`${username} removed!`);
                }
                break;
            }
        }
    },
};