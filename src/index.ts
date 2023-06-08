import "reflect-metadata";
import { config } from 'dotenv';
import { LogLevel, SapphireClient } from "@sapphire/framework";
import '@sapphire/plugin-logger/register';
import { GatewayIntentBits } from "discord.js";
import { AppDataSource } from './data-source';
import { container } from "@sapphire/framework";
config();

if (!AppDataSource.isInitialized) {
    AppDataSource.initialize().then(async () => {
        console.log('Database intialised.');
    }).catch(error => console.log(error))
}

const client = new SapphireClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    logger: { level: process.env.NODE_ENV === 'development' ? LogLevel.Trace : LogLevel.Info }
});

client.login(process.env.BOT_TOKEN);
client.on('debug', console.error).on('warn', console.error);

process.on('unhandledRejection', error => {
    container.logger.error(error);
	console.error('Unhandled promise rejection:', error);
});