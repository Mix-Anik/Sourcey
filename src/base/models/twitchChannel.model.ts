import {Entity, Column, OneToOne, Index, JoinColumn} from 'typeorm'
import {DiscordMessage} from './discordMessage.model'
import {BaseModel} from '../BaseModel'


@Entity()
export class TwitchChannel extends BaseModel {
    @Index()
    @Column({
        length: 64,
        nullable: false,
        unique: true
    })
    channelId: string

    @Index()
    @Column({
        length: 128,
        nullable: false,
        unique: true
    })
    channelName: string

    @Column({
        default: false,
        nullable: false
    })
    streaming: boolean

    @OneToOne(() => DiscordMessage, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    streamMessage: DiscordMessage
}
