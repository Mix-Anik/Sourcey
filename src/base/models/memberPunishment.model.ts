import { Entity, Column, Index } from 'typeorm'
import {BaseModel} from '../BaseModel'


export enum PunishmentType {
    BAN = 'BAN',
    MUTE = 'MUTE'
}


@Entity()
export class MemberPunishment extends BaseModel {
    @Index()
    @Column({
        length: 32,
        nullable: false
    })
    memberId: string

    @Column({
        type: 'enum',
        enum: PunishmentType,
        nullable: false
    })
    type: PunishmentType

    @Column({
        type: 'timestamptz',
        nullable: true
    })
    expirationDate: Date
}
