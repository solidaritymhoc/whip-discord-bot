const { SlashCommandBuilder } = require('discord.js');
const { Octokit } = require('octokit');
const { gitRepoName, gitRepoOwner, gitToken } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-info')
        .setDescription('See bot information and current version.'),
    async execute(interaction) {
        const octokit = new Octokit({
            auth: gitToken,
        });
        const branchInfo = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', {
            owner: gitRepoOwner,
            repo: gitRepoName,
            branch: 'main',
        });
        await interaction.reply(`Latest bot version ${branchInfo.data.commit.sha} (<${branchInfo.data.commit.html_url}>)`);
    },
};