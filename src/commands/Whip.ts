import { Subcommand } from "@sapphire/plugin-subcommands";
import { AppDataSource } from "../data-source";
import { Division } from "../entity/Division";
import { whipIssueChannelId, memberRoleId } from "../whipConfig.json";
import { ChannelType, EmbedBuilder, TextChannel } from "discord.js";

export class WhipCommand extends Subcommand {
    private divisionsRepository = AppDataSource.getRepository(Division);

    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'whip',
            description: 'Whip commands',
            subcommands: [
                { name: 'issue', chatInputRun: 'chatInputIssue' }
            ]
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(builder =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand(command => 
                    command
                        .setName('issue')
                        .setDescription('Issue initial whip notice')
                        .addStringOption(option =>
                            option.setName('division_1').setRequired(true).setDescription('First division ID').setAutocomplete(true),
                        )
                        .addStringOption(option =>
                            option.setName('division_2').setRequired(false).setDescription('Second division ID').setAutocomplete(true),
                        )
                        .addStringOption(option =>
                            option.setName('division_3').setRequired(false).setDescription('Third division ID').setAutocomplete(true),
                        )
                        .addStringOption(option =>
                            option.setName('division_4').setRequired(false).setDescription('Fourth division ID').setAutocomplete(true),
                        )
                        .addStringOption(option => 
                            option.setName('notes').setDescription('Notes displayed alongside').setRequired(false)    
                        )
                ),
            { idHints: ['1116387569484181524'] }
        );
    }

    public async chatInputIssue(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply();
    
        const division1Id = interaction.options.getString('division_1');
        if (!division1Id) {
            await interaction.editReply({ content: 'Invalid first division ID' });
            return;
        }
        var ids = [division1Id.toUpperCase()];
        for (let i = 2; i <= 4; i++) {
            let id = interaction.options.getString(`division_${i}`);
            if (id) {
                ids.push(id.toUpperCase());
            }
        }

        const embeds = [];
        for (let id of ids) {
            const division = await this.divisionsRepository.findOneBy({ shortName: id });
            if (!division) {
                await interaction.editReply({ content: `Please provide a valid division ID for division ${id}.` });
                return;
            }
            embeds.push(division.whipEmbed);
        }

        const notes = interaction.options.getString('notes');
        if (notes) {
            embeds.push(new EmbedBuilder()
                .setTitle('Explanatory notes')
                .setDescription(notes)
            );
        }

        const channel = this.container.client.channels.cache.get(whipIssueChannelId);
        if (!channel || channel.type != (ChannelType.GuildText)) {
            await interaction.editReply({ content: 'Error: Invalid channel ID specified in whipConfig.json.' });
            return;
        }
        (channel as TextChannel).send({
            content: `<@&${memberRoleId}>`,
            embeds: embeds
        });
        await interaction.editReply({ content: `Whips issued in <#${channel.id}>` });
    }
}