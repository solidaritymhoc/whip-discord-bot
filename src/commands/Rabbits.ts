import { Command } from '@sapphire/framework';

export class RabbitsCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { 
            ...options,
            description: 'Rabbits',
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(
            (builder) =>
                builder //
                    .setName(this.name)
                    .setDescription(this.description),
            { idHints: ['1116156530702684302'] }
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        return await interaction.reply('Rabbits');
    }
}
