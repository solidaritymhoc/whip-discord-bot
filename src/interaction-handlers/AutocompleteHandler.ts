import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import type { AutocompleteInteraction } from 'discord.js';
import { AppDataSource } from '../data-source';
import { Member } from '../entity/Member';
import { Division } from '../entity/Division';

export class AutocompleteHandler extends InteractionHandler {
    public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.Autocomplete
        });
    }

    public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
        return interaction.respond(result);
    }

    public override async parse(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        switch (focusedOption.name) {
            case 'member': {
                const memberRepository = AppDataSource.getRepository(Member);
                const members = await memberRepository.find();
                
                return this.some(members.map((match) => ({ name: match.redditUsername, value: match.redditUsername })));
            }
            case 'division_id': {
                const divisionRespository = AppDataSource.getRepository(Division);
                const divisions = await divisionRespository.find();

                return this.some(divisions.map((match) => ({ name: match.shortName, value: match.shortName })));
            }
            default:
                return this.none();
        }
    }
}