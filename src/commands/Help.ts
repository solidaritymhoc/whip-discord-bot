import { Subcommand } from "@sapphire/plugin-subcommands";

export class HelpCommand extends Subcommand {
    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'help',
            description: 'Help commands',
            subcommands: [
                { name: 'import-formula', chatInputRun: 'chatInputImportFormula' }
            ]
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(
            (builder) => 
                builder
                    .setName(this.name)
                    .setDescription(this.description)
                    .addSubcommand((command) => 
                        command.setName('import-formula').setDescription('The input formula for MPs')
                    ),
            { idHints: ['1116383606248583259'] }
        );
    }

    public async chatInputImportFormula(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.reply('```=JOIN(",", B5:B54)```');
    }
}