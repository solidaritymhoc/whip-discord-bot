import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";
import { ValidVotes } from "../enums/ValidVotes";
import { WhipLines } from "../enums/WhipLines";
import { Colors, EmbedBuilder } from "discord.js";
import { formatDate, voteColour } from "../utilities/Formatters";

@Entity()
export class Division {

    @PrimaryGeneratedColumn()
    id: number

    @Index({ unique: true })
    @Column()
    shortName: string

    @Column()
    longName: string

    @Index()
    @Column()
    url: string

    @Column()
    closesAt: Date

    @Column({
        type: 'enum',
        enum: ValidVotes,
        nullable: true
    })
    whipVote: ValidVotes

    @Column({
        type: 'enum',
        enum: WhipLines,
        default: WhipLines.None,
        nullable: true,
    })
    whipLine: WhipLines

    @Column({
        default: false
    })
    freeVote: boolean

    @Column({
        nullable: true
    })
    reminderSentAt: Date

    @CreateDateColumn()
    createdAt: Date

    public get closed(): boolean {
        return this.closesAt < new Date();
    }

    public get directive(): string {
        if (this.freeVote) return "Free Vote";
        else return `${this.whipLine} line ${this.whipVote.toUpperCase()}`
    }

    public get whipEmbed(): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(`${this.shortName} - **${this.directive}**`)
            .setDescription(`Division ends ${formatDate(this.closesAt)}`)
            .setURL(this.url)
            .setColor(voteColour(this.freeVote ? ValidVotes.Free : this.whipVote))
            .setFooter({ text: this.longName });
    }
}