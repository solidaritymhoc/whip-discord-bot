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
exports.HelpCommand = void 0;
const plugin_subcommands_1 = require("@sapphire/plugin-subcommands");
class HelpCommand extends plugin_subcommands_1.Subcommand {
    constructor(context, options) {
        super(context, Object.assign(Object.assign({}, options), { name: 'help', description: 'Help commands', subcommands: [
                { name: 'import-formula', chatInputRun: 'chatInputImportFormula' }
            ] }));
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((command) => command.setName('import-formula').setDescription('The input formula for MPs')), { idHints: ['1116383606248583259'] });
    }
    chatInputImportFormula(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield interaction.reply('```=JOIN(",", B5:B54)```');
        });
    }
}
exports.HelpCommand = HelpCommand;
