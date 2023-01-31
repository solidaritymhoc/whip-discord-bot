const { SlashCommandBuilder } = require('discord.js');
const { Octokit } = require('octokit');
const config = require('config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-info')
        .setDescription('See bot information and current version.'),
    async execute(interaction) {
        const octokit = new Octokit({
            auth: config.get('git.apiToken'),
        });
        const branchInfo = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', {
            owner: config.get('git.owner'),
            repo: config.get('git.name'),
            branch: 'main',
        });
        await interaction.reply(`Latest bot version ${branchInfo.data.commit.sha} (<${branchInfo.data.commit.html_url}>)`);
    },
};