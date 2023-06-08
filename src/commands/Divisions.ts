import { Subcommand } from "@sapphire/plugin-subcommands";
import { AppDataSource } from "../data-source";
import { Division } from "../entity/Division";
import { EmbedBuilder } from "discord.js";
import { commentToVoteEnum, formatDate } from "../utilities/Formatters";
import { MoreThan } from "typeorm";
import { fetchThread } from "../reddit/Subreddit";
import moment from "moment";
import { ValidVotes } from "../enums/ValidVotes";
import { WhipLines } from "../enums/WhipLines";

export class DivisionsCommand extends Subcommand {
    private divisionsRepository = AppDataSource.getRepository(Division);

    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'divisions',
            description: 'Divisions management',
            subcommands: [
                {
                    name: 'list',
                    chatInputRun: 'chatInputList',
                },
                {
                    name: 'active',
                    chatInputRun: 'chatInputActive',
                },
                {
                    name: 'add',
                    chatInputRun: 'chatInputAdd',
                },
                {
                    name: 'remove',
                    chatInputRun: 'chatInputRemove',
                },
            ]
        })
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(
            (builder) =>
                builder
                    .setName(this.name)
                    .setDescription(this.description)
                    .addSubcommand((command) => 
                        command.setName('list').setDescription('List all divisions')
                    )
                    .addSubcommand((command) => 
                        command.setName('active').setDescription('List all active divisions')
                    )
                    .addSubcommand((command) =>
                        command
                            .setName('add')
                            .setDescription('Add a new division')
                            .addStringOption((option) =>
                                option 
                                    .setName('url')
                                    .setDescription('The URL of the division')
                                    .setRequired(true)
                            )
                            .addStringOption(option =>
                                option.setName('whip').setRequired(true).setDescription('Aye, No, Abs, Free').setChoices(
                                    { name: 'Aye', value: 'aye' },
                                    { name: 'No', value: 'no' },
                                    { name: 'Abstain', value: 'abs' },
                                    { name: 'Free', value: 'free' },
                                ),
                            )
                            .addIntegerOption(option =>
                                option.setName('line').setRequired(true).setDescription('None, 1, 2, 3').setChoices(
                                    { name: 'None', value: 4 },
                                    { name: '1 Line', value: 1 },
                                    { name: '2 Line', value: 2 },
                                    { name: '3 Line', value: 3 },
                                ),
                            )
                            .addIntegerOption(option =>
                                option.setName('days_ends_in').setDescription('Defaults to 3. Bot will assume ending 10pm UK time.'),
                            ),
                    )
                    .addSubcommand((command) => 
                        command
                            .setName('remove')
                            .setDescription('Remove a division')
                            .addStringOption((option) =>
                                option 
                                    .setName('division_id')
                                    .setDescription('The division ID')
                                    .setRequired(true)
                                    .setAutocomplete(true)
                            ),
                    ),
            { idHints: ['1116156534100078593'] }
        );
    }    

    public async chatInputList(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply();

        const divisions = await this.divisionsRepository.find({
            order: {
                closesAt: 'ASC'
            }
        });
        if (divisions.length == 0) {
            interaction.editReply('No divisions found.');
            return;
        }

        const responseEmbed = new EmbedBuilder()
            .setTitle('All divisions')
            .setDescription('Manage these with the `divisions add` and `divisions remove` subcommands.');
        for (const division of divisions) {
            // let remindersSentString = 'No reminders sent.';
            // if (division.first_reminder_sent && division.second_reminder_sent) {
            //     remindersSentString = '2 reminders sent.';
            // }
            // else if (division.first_reminder_sent) {
            //     remindersSentString = '1 reminder sent.';
            // }
            const endsString = division.closed ? '**Closed on** ' : 'Ends at';
            responseEmbed.addFields({
                name: `${division.shortName} ${division.longName} - ${division.url} - **${division.directive}**`,
                value: `${endsString} ${formatDate(division.closesAt)}.`,
            });
        }

        await interaction.editReply({ embeds: [responseEmbed] });
    }

    public async chatInputActive(interaction: Subcommand.ChatInputCommandInteraction) {
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

        const responseEmbed = new EmbedBuilder()
        .setTitle('Active divisions')
        .setDescription('Manage these with the `divisions add` and `divisions remove` subcommands.');
        for (const division of divisions) {
            // let remindersSentString = 'No reminders sent.';
            // if (division.first_reminder_sent && division.second_reminder_sent) {
            //     remindersSentString = '2 reminders sent.';
            // }
            // else if (division.first_reminder_sent) {
            //     remindersSentString = '1 reminder sent.';
            // }
            responseEmbed.addFields({
                name: `${division.shortName} ${division.longName} - ${division.url} - **${division.directive}**`,
                value: `Ends ${formatDate(division.closesAt)}.`,
            });
        }

        await interaction.editReply({ embeds: [responseEmbed] });
    }
    
    public async chatInputAdd(interaction: Subcommand.ChatInputCommandInteraction) {
        const urlOption = interaction.options.getString('url');
        const whipVoteOption = interaction.options.getString('whip');
        const whipLineOption = interaction.options.getInteger('line');
        var daysEndsInOption = interaction.options.getInteger('days_ends_in');
        if (daysEndsInOption && daysEndsInOption < 1) {
            daysEndsInOption = null;
        }

        // Validation
        if (!urlOption || !whipLineOption || !whipVoteOption) {
            await interaction.reply({ content: 'Please provide a reddit URL and whip setting.'});
            return;
        }
        else if (await this.divisionsRepository.findOneBy({ url: urlOption })) {
            await interaction.reply({ content: `Division with URL ${urlOption} already on list.` });
            return;
        }

        const thread = await fetchThread(urlOption);
        if (!thread) {
            await interaction.reply({ content: 'Error. Check you have entered a valid URL.' });
            return;
        }

        const division = new Division();
        division.shortName = thread.shortName;
        division.longName = thread.longName;
        division.url = thread.url;
        division.closesAt = moment().add(daysEndsInOption ?? 3, 'days').hour(22).minute(0).second(0).toDate();

        if (whipVoteOption == 'free') {
            division.freeVote = true;
        }
        else {
            division.whipVote = whipVoteOption as ValidVotes;
            division.whipLine = whipLineOption as WhipLines;
        }
        await this.divisionsRepository.save(division);

        await interaction.reply({ content: `Added new division ${division.shortName} ${division.longName}!` });
    }

    public async chatInputRemove(interaction: Subcommand.ChatInputCommandInteraction) {
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

        await this.divisionsRepository.remove(division);
        
        await interaction.editReply('Division removed.');
    }
}
