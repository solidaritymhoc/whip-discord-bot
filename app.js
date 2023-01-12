// Import file path libraries and cron
const cron = require('node-cron');
const fs = require('node:fs');
const path = require('node:path');

// Import discord.js
const { Client, Events, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { token } = require('./config.json');
const moment = require('moment-timezone');
const { removeExpiredDivisions } = require('./functions/tasks');

// Set moment default time zone
moment.tz.setDefault('Europe/London');

// Create bot client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Read commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
    else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Process interactions (slash commands)
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
    catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login event
client.once(Events.ClientReady, async () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
	client.user.setPresence({ activities: [{ name: 'Pepsiman™️', type: ActivityType.Listening, url: 'https://www.youtube.com/watch?v=z54MpfR3XE4' }], status: 'dnd' });
});

// Cron job
const removeExpiredDivisionsTask = cron.schedule('* * * * * *', async () => await removeExpiredDivisions(), {
	scheduled: true,
	timezone: 'Europe/London',
});

removeExpiredDivisionsTask.start();

client.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

// Start the bot
client.login(token);

module.exports.discordClient = client;