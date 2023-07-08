"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = require("dotenv");
const framework_1 = require("@sapphire/framework");
require("@sapphire/plugin-logger/register");
const discord_js_1 = require("discord.js");
const data_source_1 = require("./data-source");
const framework_2 = require("@sapphire/framework");
(0, dotenv_1.config)();
if (!data_source_1.AppDataSource.isInitialized) {
    data_source_1.AppDataSource.initialize().then(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Database intialised.');
    })).catch(error => console.log(error));
}
const client = new framework_1.SapphireClient({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages],
    logger: { level: process.env.NODE_ENV === 'development' ? framework_1.LogLevel.Trace : framework_1.LogLevel.Info }
});
client.login(process.env.BOT_TOKEN);
client.on('debug', console.error).on('warn', console.error);
process.on('unhandledRejection', error => {
    framework_2.container.logger.error(error);
    console.error('Unhandled promise rejection:', error);
});
