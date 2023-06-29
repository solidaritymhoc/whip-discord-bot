import { Subcommand } from "@sapphire/plugin-subcommands";
import { AppDataSource } from "../data-source";
import { Division } from "../entity/Division";
import { whipIssueChannelId, memberRoleId } from "../whipConfig.json";
import { ChannelType, EmbedBuilder, TextChannel } from "discord.js";
import { fetchThread } from "../reddit/Subreddit";
import { ValidVotes } from "../enums/ValidVotes";
import { Thread } from "../reddit/Thread";
import { formatDate } from "../utilities/Formatters";
import { MoreThan } from "typeorm";

export class WhipCommand extends Subcommand {
    private divisionsRepository = AppDataSource.getRepository(Division);

    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'whip',
            description: 'Whip commands',
            subcommands: [
                { name: 'issue', chatInputRun: 'chatInputIssue' },
                { name: 'check', chatInputRun: 'chatInputCheck' },
                { name: 'check-active', chatInputRun: 'chatInputCheckActive' },
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
                )
                .addSubcommand(command => 
                    command
                        .setName('check')
                        .setDescription('Check the status of a division')
                        .addStringOption(option =>
                            option.setName('division_id').setDescription('Division ID').setAutocomplete(true).setRequired(true)
                        ) 
                )
                .addSubcommand(command => 
                    command
                        .setName('check-active')
                        .setDescription('Check the status of all active divisions')
                ),
            { idHints: ['1116387569484181524'] }
        );
    }

    private async createCheckEmbed(division: Division, thread: Thread) {
        const embed = new EmbedBuilder()
            .setTitle(`Status of ${division.shortName}`)
            .setDescription(`${division.directive} - ends ${formatDate(division.closesAt)}`)
            .setURL(division.url)
            .setFooter({ text: division.longName });


        console.log('Ayes'+ thread.getAyes());
        let ayeField = ''; 
        let noField = '';
        let abstainField = '';
        let noVoteField = '';
        thread.getAyes().forEach(username => {
            ayeField += `${username} \n`;   
        });
        thread.getNoes().forEach(username => {
            noField += `${username} \n`;   
        });
        thread.getAbstentions().forEach(username => {
            abstainField += `${username} \n`;   
        });
        const notVoted = await thread.getMembersNotVoted()
        notVoted.forEach(username => {
            noVoteField += `${username} \n`;   
        });

        embed.addFields(
            { name: 'Aye votes', value: ayeField != '' ? ayeField : 'None recorded.' },
            { name: 'No votes', value: noField != '' ? noField : 'None recorded.' },
            { name: 'Abstain votes', value: abstainField != '' ? abstainField : 'None recorded.' },
            { name: 'No vote recorded', value: noVoteField != '' ? noVoteField : 'None recorded.' },
        );

        return embed;
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

    public async chatInputCheck(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply();
        
        const divisionId = interaction.options.getString('division_id');
        if (!divisionId) {
            await interaction.editReply({ content: 'Please provide a division ID.' });
            return;
        }    
        const division = await this.divisionsRepository.findOneBy({ shortName: divisionId });
        if (!division) {
            await interaction.editReply({ content: 'Please provide a valid division ID.' });
            return;
        }
        const thread = await fetchThread(division.url);
        if (!thread) {
            await interaction.reply({ content: 'Error. Re-add the division.' });
            return;
        }

        const responseEmbed = await this.createCheckEmbed(division, thread);

        await interaction.editReply({ embeds: [responseEmbed] });
    }

    public async chatInputCheckActive(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply();
        
        const divisions = await this.divisionsRepository.find({
            where: {
                closesAt: MoreThan(new Date()),
            },
            order: {
                closesAt: 'ASC'
            }
        })
        if (divisions.length == 0) {
            interaction.editReply('No divisions found.');
            return;
        }

        const embeds = [];
        for (const division of divisions) {
            const thread = await fetchThread(division.url);
            if (!thread) {
                await interaction.reply({ content: `Error. Re-add the division ${division.shortName}.` });
                return;
            }
            const responseEmbed = await this.createCheckEmbed(division, thread);
            embeds.push(responseEmbed);
        }


        await interaction.editReply({ embeds: embeds });
    }
}