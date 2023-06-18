import { Entity, PrimaryGeneratedColumn, Column, OneToOne, Relation } from "typeorm"
import { Proxy } from "./Proxy"

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

    @OneToOne(() => Proxy, (proxy) => proxy.member)
    activeProxy: Relation<Proxy>
}
