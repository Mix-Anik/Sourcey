import { Entity, Column, Index } from 'typeorm'
import {BaseModel} from '../BaseModel'


@Entity()
export class Emoji extends BaseModel {
    @Index()
    @Column({
        length: 512,
        nullable: false,
        unique: true
    })
    code: string

    @Column({
        length: 512,
        nullable: false
    })
    snowflake: string
}
