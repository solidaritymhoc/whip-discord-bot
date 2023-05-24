// Import libraries
const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
const config = require('config');

// Import configuration
const token = config.get('bot.token');
const enableReadyLog = config.get('logging.enableReadyLog');

// Import discord.js
const { Client, Events, GatewayIntentBits, Collection, ActivityType } = require('discord.js');

// Import moment
const moment = require('moment-timezone');

// Import functions
const { removeExpiredDivisions, issueReminderNotices } = require('./functions/tasks');
const { logStringToDevChannel, logLevels } = require('./functions/logging');

// Set moment default time zone
moment.tz.setDefault('Europe/London');

// Create bot client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Create cooldowns collection
client.cooldowns = new Collection();

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
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		const { cooldowns } = client;

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDuration = 3;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1000);
				return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
			}
		}

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
	else if (interaction.isAutocomplete()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.autocomplete(interaction);
		}
		catch (error) {
			console.error(error);
		}
	}
});

// Login event
client.once(Events.ClientReady, async () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
	if (enableReadyLog) await logStringToDevChannel('Ready!', logLevels.Info);
	await client.user.setPresence({ activities: [{ name: 'Twinkle the Bunny', type: ActivityType.Watching }], status: 'online' });
});

// Cron job
const removeExpiredDivisionsTask = cron.schedule('* * * * * *', async () => await removeExpiredDivisions(), {
	scheduled: true,
	timezone: 'Europe/London',
});

// const issueReminderNoticesTask = cron.schedule('*/1 * * * *', async () => await issueReminderNotices(), {
// 	scheduled: true,
// 	timezone: 'Europe/London',
// });

removeExpiredDivisionsTask.start();
// issueReminderNoticesTask.start();

client.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

// Start the bot
client.login(token);

module.exports.discordClient = client;