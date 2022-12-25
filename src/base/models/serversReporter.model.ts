import {Entity, Column, OneToOne, OneToMany, JoinColumn} from 'typeorm'
import {BaseModel} from '../BaseModel'
import {Server} from './server.model'
import {DiscordMessage} from './discordMessage.model'


@Entity()
export class ServersReporter extends BaseModel {
    @OneToMany(() => Server, s => s.serversReporter)
    servers: Server[]

    // TODO: OneToMany doesn't support cascade delete...
    //  Currently it seems that you can only use it with ManyToOne https://github.com/typeorm/typeorm/issues/1913
    @OneToOne(() => DiscordMessage, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    @JoinColumn({name: 'message_id'})
    message: DiscordMessage

    @Column({
        nullable: true
    })
    title: string

    @Column({
        nullable: true
    })
    authorImageURL: string
}
