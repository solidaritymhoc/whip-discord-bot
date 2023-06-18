import { Subcommand } from "@sapphire/plugin-subcommands";
import { AppDataSource } from "../data-source";
import { Proxy } from "../entity/Proxy";
import { EmbedBuilder } from "discord.js";
import { formatDate } from "../utilities/Formatters";
import { Member } from "../entity/Member";
import moment from "moment-timezone";

export class ProxyCommand extends Subcommand {
    private proxyRepository = AppDataSource.getRepository(Proxy);
    private memberRepository = AppDataSource.getRepository(Member);

    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'proxy',
            description: 'Proxy management',
            subcommands: [
                {
                    name: 'list',
                    chatInputRun: 'chatInputList'
                },
                {
                    name: 'add',
                    chatInputRun: 'chatInputAdd',
                },
                {
                    name: 'remove',
                    chatInputRun: 'chatInputRemove',
                }
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
                                    .setName('member')
                                    .setDescription('The member being proxied')
                                    .setRequired(true)
                                    .setAutocomplete(true)
                            )
                            .addStringOption((option) =>
                                option 
                                    .setName('agent')
                                    .setDescription('The agent for the proxy')
                                    .setRequired(true)
                                    .setAutocomplete(true)
                            )
                            .addIntegerOption(option =>
                                option.setName('days_ends_in').setRequired(true).setDescription('Days duration of the proxy'),
                            ),
                    )
                    .addSubcommand((command) => 
                        command
                            .setName('remove')
                            .setDescription('Deactivate a proxy')
                            .addStringOption((option) =>
                                option 
                                    .setName('proxy')
                                    .setDescription('The username of the member being proxied')
                                    .setRequired(true)
                                    .setAutocomplete(true)
                            ),
                    ),
            { idHints: ['1119864466968948736'] }
        );
    }

    public async chatInputList(interaction: Subcommand.ChatInputCommandInteraction) {
        const proxies = await this.proxyRepository.find({
            relations: { member: true, agent: true }
        });
        if (proxies.length == 0) {
            interaction.reply('No proxies active.');
            return;
        }

        const responseEmbed = new EmbedBuilder()
            .setTitle('Active proxies');
        for (const proxy of proxies) {
            responseEmbed.addFields({
                name: proxy.member.redditUsername,
                value: `By ${proxy.agent.redditUsername} until ${formatDate(proxy.expiresAt)}`
            });
        }

        await interaction.reply({ embeds: [responseEmbed] });
    }

    public async chatInputAdd(interaction: Subcommand.ChatInputCommandInteraction) {
        const memberName = interaction.options.getString('member');
        const agentName = interaction.options.getString('agent');
        const daysEndsIn = interaction.options.getInteger('days_ends_in');
        if ((!memberName || !agentName) || (memberName == agentName) || !daysEndsIn) {
            await interaction.reply('A value is missing that is required, or if you did provide them, they must be unique.');
            return;
        }
        
        const member = await this.memberRepository.findOneBy({ redditUsername: memberName });
        const agent = await this.memberRepository.findOneBy({ redditUsername: agentName });
        if (!member || !agent) {
            await interaction.reply('Member or agent not found.');
            return;
        }

        const proxy = new Proxy();
        proxy.expiresAt = moment().add(daysEndsIn, 'days').hour(22).minute(0).second(0).toDate();
        proxy.member = member;
        proxy.agent = agent;
        await this.proxyRepository.save(proxy);

        await interaction.reply({ content: `Added new proxy for ${proxy.member.redditUsername}!` });
    }

    public async chatInputRemove(interaction: Subcommand.ChatInputCommandInteraction) {
        const memberName = interaction.options.getString('proxy');
        if (!memberName) {
            await interaction.reply('A value is missing that is required, or if you did provide them, they must be unique.');
            return;
        }

        const proxy = await this.proxyRepository.createQueryBuilder("proxy")
            .leftJoinAndSelect("proxy.member", "member")
            .where("member.redditUsername = :redditUsername", { redditUsername: memberName })
            .getOne();

        console.log(proxy);
    }
}