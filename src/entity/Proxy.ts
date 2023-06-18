import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Relation } from "typeorm";
import { Member } from "./Member";

@Entity()
export class Proxy {

    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => Member, (member) => member.activeProxy)
    @JoinColumn()
    member: Relation<Member>

    @OneToOne(() => Member)
    @JoinColumn()
    agent: Relation<Member>

    @Column()
    expiresAt: Date
}