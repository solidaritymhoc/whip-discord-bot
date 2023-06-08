import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Member {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    redditUsername: string

    @Column({
        nullable: true
    })
    discordSnowflake: string

    @Column({
        default: true
    })
    sendDiscordReminders: boolean

    @Column({
        default: false
    })
    sendRedditReminders: boolean
}
