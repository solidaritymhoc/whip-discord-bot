import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";
import { ValidVotes } from "../enums/ValidVotes";
import { WhipLines } from "../enums/WhipLines";

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
}