import {Entity, Column, OneToOne, OneToMany, Index, JoinColumn} from 'typeorm'
import {DiscordMessage} from './discordMessage.model'
import {BaseModel} from '../BaseModel'
import {RoleManagerRole} from './RoleManagerRole.model'


@Entity()
export class RoleManager extends BaseModel {
    @Index()
    @Column({
        length: 64,
        nullable: false,
        default: 'Self-Assignable Roles'
    })
    title: string

    @Column({
        length: 16,
        nullable: false,
        default: '#000000'
    })
    color: string

    @OneToOne(() => DiscordMessage, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    discordMessage: DiscordMessage

    @OneToMany(() => RoleManagerRole, rmr => rmr.roleManager, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    roles: RoleManagerRole[]
}
