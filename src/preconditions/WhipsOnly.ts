// import { Precondition } from '@sapphire/framework';
// import type { CommandInteraction, ContextMenuCommandInteraction, Guild, Message } from 'discord.js';

// export class OwnerOnlyPrecondition extends Precondition {
//     public override async messageRun(message: Message) {
//         // for Message Commands
//         return this.checkOwner(message.author.id);
//     }

//     public override async chatInputRun(interaction: CommandInteraction) {
//         // for Slash Commands
//         return this.checkOwner(interaction.user.id);
//     }

//     public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
//         // for Context Menu Command
//         return this.checkOwner(interaction.guild, interaction.user.id);
//     }

//     private async checkOwner(guild: Guild, userId: string) {
        
//         // return Config.bot.owners!.includes(userId)
//         //   ? this.ok()
//         //   : this.error({ message: 'Only the bot owner can use this command!' });
//     }
// }