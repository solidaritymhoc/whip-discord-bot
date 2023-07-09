import { Subcommand } from "@sapphire/plugin-subcommands";
import { AppDataSource } from "../data-source";
import { Member } from "../entity/Member";
import { EmbedBuilder } from "discord.js";
import { isValidJson } from "../utilities/Formatters";
import { Division } from "../entity/Division";
import dayjs from 'dayjs';

export class MembersCommand extends Subcommand {
    private memberRepository = AppDataSource.getRepository(Member);

    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'members',
            description: 'Members management',
            subcommands: [
                {
                    name: 'list',
                    chatInputRun: 'chatInputList',
                },
                {
                    name: 'add',
                    chatInputRun: 'chatInputAdd',
                },
                {
                    name: 'remove',
                    chatInputRun: 'chatInputRemove',
                },
                {
                    name: 'reminder-channels',
                    chatInputRun: 'chatInputReminderChannels',
                },
                {
                    name: 'import',
                    chatInputRun: 'chatInputImport',
                },
                {
                    name: 'phase-out',
                    chatInputRun: 'chatInputPhaseOut'
                },
            ]
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(
            (builder) =>
                builder //
                    .setName(this.name)
                    .setDescription(this.description)
                    .addSubcommand((command) => 
                        command.setName('list').setDescription('List all members')
                    )
                    .addSubcommand((command) =>
                        command
                            .setName('add')
                            .setDescription('Add a new member')
                            .addStringOption((option) =>
                                option 
                                    .setName('reddit-username')
                                    .setDescription('The member\'s reddit username, without the u/')
                                    .setRequired(true)
                            )
                            .addUserOption((option) => 
                                option
                                    .setName('discord-user')
                                    .setDescription('The member\'s Discord account')
                                    .setRequired(false)
                            ),
                    )
                    .addSubcommand((command) => 
                        command
                            .setName('remove')
                            .setDescription('Remove a member')
                            .addStringOption((option) =>
                                option 
                                    .setName('member')
                                    .setDescription('The member')
                                    .setRequired(true)
                                    .setAutocomplete(true)
                            ),
                    )
                    .addSubcommand((command) => 
                        command
                            .setName('reminder-channels')
                            .setDescription('Set the member\'s reminder channels')
                            .addStringOption((option) =>
                                option 
                                    .setName('member')
                                    .setDescription('The member')
                                    .setRequired(true)
                                    .setAutocomplete(true)
                            )
                            .addBooleanOption((option) =>
                                option
                                    .setName('discord')
                                    .setDescription('Send automatic reminders via Discord')
                                    .setRequired(true)
                            )
                            .addBooleanOption((option) =>
                                option
                                    .setName('reddit')
                                    .setDescription('Send automatic reminders via Reddit')
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((command) => 
                        command
                            .setName('import')
                            .setDescription('Import MPs from list (provided on whip sheet), /help import-formula')
                            .addStringOption((option) =>
                                option
                                    .setName('input')
                                    .setDescription('The comma delimited input')
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((command) =>
                        command
                            .setName('phase-out')
                            .setDescription('Set a division the member will be phased out from.')
                            .addStringOption((option) =>
                                option 
                                    .setName('member')
                                    .setDescription('The member')
                                    .setRequired(true)
                                    .setAutocomplete(true)
                            )
                            .addStringOption((option) =>
                                option
                                    .setName('datetime')
                                    .setDescription('YYYY-MM-DD HH:mm e.g. 2023-07-09 10:00')
                                    .setAutocomplete(false)
                                    .setRequired(true)
                            )
                    ),
            { idHints: ['1116156532959232090'] }
        );
    }

    public async chatInputList(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply();
        
        const members = await this.memberRepository.find();
        if (members.length == 0) {
            interaction.editReply('No members found.');
            return;
        }

        const responseEmbed = new EmbedBuilder()
            .setTitle('Current members list');
        for (const member of members) {
            responseEmbed.addFields({
                name: member.redditUsername,
                value: (member.discordSnowflake ? `<@${member.discordSnowflake}>` : 'No Discord account') + ' - ' + this.formatReminderChannelsString(member),
            })
        }
        
        await interaction.editReply({ embeds: [responseEmbed] });
    }

    public async chatInputAdd(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply();

        const redditUsername = interaction.options.getString('reddit-username');
        const discordSnowflake = interaction.options.get('discord-user')?.value ?? null;
        if (!redditUsername) {
            await interaction.editReply({ content: 'Please provide a username.' });
            return;
        }
        else if (redditUsername.startsWith('u/') || redditUsername.startsWith('/u/')) {
            await interaction.editReply({ content: 'Please provide a username without the /u/ prefix.'});
            return;
        }

        const member = new Member();
        member.redditUsername = redditUsername;
        member.discordSnowflake = discordSnowflake?.toString() ?? '';
        await this.memberRepository.save(member);

        await interaction.editReply({ content: `Added member ${member.redditUsername}!` });
    }

    public async chatInputRemove(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply();
        
        const redditUsername = interaction.options.getString('member');
        if (!redditUsername) {
            await interaction.editReply({ content: 'Please provide a username.' });
            return;
        }    
        const member = await this.memberRepository.findOneBy({ redditUsername: redditUsername });
        if (!member) {
            await interaction.editReply({ content: 'Please provide a valid username.' });
            return;
        }

        await this.memberRepository.remove(member);
        
        await interaction.editReply('Member removed.');
    }
    
    public async chatInputReminderChannels(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply();
        
        const redditUsername = interaction.options.getString('member');
        if (!redditUsername) {
            await interaction.editReply({ content: 'Please provide a username.' });
            return;
        }
        const sendRedditReminders = interaction.options.getBoolean('reddit') ?? false;
        const sendDiscordReminders = interaction.options.getBoolean('discord') ?? false;

        const member = await this.memberRepository.findOneBy({ redditUsername: redditUsername });
        if (!member) {
            await interaction.editReply({ content: 'Please provide a valid username.' });
            return;
        }
        
        if (sendDiscordReminders && !member.discordSnowflake) {
            await interaction.editReply('Error: Please edit the member to add a Discord account before enabling Discord reminders.')
            return;
        }
        member.sendDiscordReminders = sendDiscordReminders;
        member.sendRedditReminders = sendRedditReminders;
        await this.memberRepository.save(member);
        
        await interaction.editReply({ content: `Edited reminder channels for member ${member.redditUsername}!` });
    }

    public async chatInputImport(interaction: Subcommand.ChatInputCommandInteraction) {
        const input = interaction.options.getString('input');
        if (!input) {
            await interaction.reply({ content: 'Please provide valid input.' });
            return;
        }
        await interaction.deferReply();

        const memberUsernames = (await this.memberRepository.find()).map(member => member.redditUsername);
        var arr = input.split(/[ ,]+/);
        arr = arr.filter(entry => entry.trim() != '');
        const usernames = arr.filter(entry => !memberUsernames.includes(entry));
        for (const i in usernames) {
            const member = new Member();
            member.redditUsername = usernames[i];
            member.sendDiscordReminders = false;
            await this.memberRepository.save(member);
        }

        await interaction.editReply({ content: `Added ${arr.length} members excluding duplicates.` });
    }

    public async chatInputPhaseOut(interaction: Subcommand.ChatInputCommandInteraction) {
        await interaction.deferReply();

        const datetime = interaction.options.getString('datetime');
        const formattedDateTime = dayjs(datetime);
        if (!formattedDateTime.isValid()) {
            await interaction.editReply({ content: 'Datetime invalid. See command option description for the correct format.' });
            return;
        }

        const redditUsername = interaction.options.getString('member');
        if (!redditUsername) {
            await interaction.editReply({ content: 'Please provide a username.' });
            return;
        } 
        const member = await this.memberRepository.findOneBy({ redditUsername: redditUsername });
        if (!member) {
            await interaction.editReply({ content: 'Please provide a valid username.' });
            return;
        }

        member.phaseOutFrom = formattedDateTime.toDate();
        this.memberRepository.save(member);

        await interaction.editReply({ content: `${member.redditUsername} phased out from ${formattedDateTime.toString()}.` });
    }

    private formatReminderChannelsString(member: Member) {
        if (member.sendDiscordReminders && member.sendRedditReminders) {
            return "Auto Discord+Reddit reminders";
        }
        else if (member.sendDiscordReminders) {
            return "Auto Discord reminders";
        }
        else if (member.sendRedditReminders) {
            return "Auto Reddit reminders";
        }
        else {
            return "No auto reminders";
        }

    }
}