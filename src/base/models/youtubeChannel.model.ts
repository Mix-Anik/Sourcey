import {Entity, Column, OneToOne, Index, JoinColumn} from 'typeorm'
import {DiscordMessage} from './discordMessage.model'
import {BaseModel} from '../BaseModel'


@Entity()
export class YoutubeChannel extends BaseModel {
    @Index()
    @Column({
        length: 64,
        nullable: false,
        unique: true
    })
    channelId: string

    @Column({
        type: 'timestamptz',
        nullable: false
    })
    lastUploadDate: Date

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
