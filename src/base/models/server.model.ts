import {Entity, Column, ManyToOne, JoinColumn} from 'typeorm'
import {BaseModel} from '../BaseModel'
import {ServersReporter} from './serversReporter.model'


@Entity()
export class Server extends BaseModel {
    @Column({
        length: 32,
        nullable: false
    })
    ip: string

    @Column({
        nullable: false
    })
    port: number

    @Column({
        nullable: false
    })
    game: string

    @ManyToOne(() => ServersReporter, sr => sr.servers, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    @JoinColumn({name: 'servers_reporter_id'})
    serversReporter: ServersReporter
}
