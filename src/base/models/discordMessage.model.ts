import {Entity, Column, Index} from 'typeorm'
import {BaseModel} from '../BaseModel'


@Index(['channelId', 'messageId'])
@Entity()
export class DiscordMessage extends BaseModel {
    @Column({
        length: 32,
        nullable: false
    })
    channelId: string

    @Column({
        length: 32,
        nullable: false
    })
    messageId: string
}
